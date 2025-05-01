import { account, ID } from './index';
import { goto } from '$app/navigation';
import { writable, get as getStore } from 'svelte/store';
import { dev } from '$app/environment';
import { browser } from '$app/environment';

export const user = writable<any>(null);
export const isAuthenticated = writable<boolean>(false);
export const isRefreshing = writable<boolean>(false);

// Track when we last checked auth status
const AUTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
let lastAuthCheck = 0;

/**
 * Check if we should refresh the auth state based on time elapsed
 */
function shouldRefreshAuth() {
  const now = Date.now();
  return now - lastAuthCheck > AUTH_CHECK_INTERVAL;
}

/**
 * Get the current authenticated user
 * @param options Configuration options
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(options: { 
  force?: boolean; // Force a refresh even if recently checked
  redirectToLogin?: boolean; // Whether to redirect to login if not authenticated
  quiet?: boolean; // Don't log messages
} = {}) {
  const { force = false, redirectToLogin = false, quiet = false } = options;
  
  // Skip if we recently checked and force isn't true
  if (!force && !shouldRefreshAuth() && getStore(user) && getStore(isAuthenticated)) {
    if (dev && !quiet) console.log('CLIENT: Using cached auth state, skipping check');
    return getStore(user);
  }
  
  // Update the last check time
  lastAuthCheck = Date.now();
  
  if (dev && !quiet) console.log('CLIENT: Checking current user status');
  
  // Don't attempt auth checks if we're not in a browser
  if (!browser) {
    if (dev && !quiet) console.log('CLIENT: Skipping auth check - not in browser context');
    return null;
  }
  
  try {
    // Flag that we're refreshing auth
    isRefreshing.set(true);
    
    // Check for server-validated auth header if coming from a server-rendered page
    const serverValidated = document.querySelector('meta[name="auth-validated"]')?.getAttribute('content') === 'true';
    if (serverValidated && !force) {
      if (dev && !quiet) console.log('CLIENT: Server already validated auth, skipping check');
      return getStore(user); 
    }
    
    // Try to get current user, which requires authentication
    const currentUser = await account.get();
    if (dev && !quiet) console.log('CLIENT: User authenticated:', currentUser.$id);
    
    // Set our auth state
    user.set(currentUser);
    isAuthenticated.set(true);
    
    // Set our custom cookie to help with server/client sync
    if (browser) {
      document.cookie = 'client_logged_in=true; path=/; max-age=86400'; // 24 hours
    }
    
    return currentUser;
  } catch (error: any) {
    // Clear the user state if we couldn't get the current user
    user.set(null);
    isAuthenticated.set(false);
    
    if (dev && !quiet) {
      console.log('CLIENT: Auth error code:', error.code);
      console.log('CLIENT: Auth error message:', error.message);
    }
    
    // Don't throw errors for expected auth failures
    if (error.code === 401) {
      // This is normal for unauthenticated users or expired sessions
      if (dev && !quiet) console.log('CLIENT: User not authenticated or session expired (401)');
      
      // If redirectToLogin is true, redirect to login
      if (redirectToLogin && browser) {
        const currentPath = window.location.pathname;
        const isProtectedRoute = currentPath.startsWith('/dashboard');
        
        if (isProtectedRoute) {
          if (dev && !quiet) console.log('CLIENT: Redirecting to login');
          goto(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
        }
      }
      
      // Clear client_logged_in cookie since we're not authenticated
      if (browser) {
        document.cookie = 'client_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
    } else {
      // Log other errors that might be unexpected
      console.error('CLIENT: Error getting current user:', error.message || error);
    }
    
    return null;
  } finally {
    isRefreshing.set(false);
  }
}

export async function createAccount(email: string, password: string, name: string) {
  try {
    // Updated for Appwrite SDK v17+
    await account.create(ID.unique(), email, password, name);
    await login(email, password);
    return true;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  if (dev) console.log('CLIENT: Starting login process');
  
  try {
    // Clear any existing session state first to ensure clean login
    user.set(null);
    isAuthenticated.set(false);
    
    // Try to create a new session
    if (dev) console.log('CLIENT: Creating email/password session');
    const session = await account.createEmailPasswordSession(email, password);
    if (dev) console.log('CLIENT: Session created successfully:', session.$id);
    
    // Update the current user store
    if (dev) console.log('CLIENT: Fetching user after login');
    const updatedUser = await account.get();
    if (dev) console.log('CLIENT: Logged in user:', updatedUser.$id);
    
    user.set(updatedUser);
    isAuthenticated.set(true);
    lastAuthCheck = Date.now(); // Update last check time
    
    // Set our custom cookie to help with server/client sync
    if (browser) {
      document.cookie = 'client_logged_in=true; path=/; max-age=86400'; // 24 hours
    }
    
    // Get the redirect URL from the query string, defaulting to dashboard
    let redirectTo = '/dashboard';
    if (browser) {
      const urlParams = new URLSearchParams(window.location.search);
      const paramRedirect = urlParams.get('redirectTo');
      if (paramRedirect) {
        redirectTo = paramRedirect;
      }
    }
    
    if (dev) console.log('CLIENT: Redirecting to:', redirectTo);
    goto(redirectTo);
    return true;
  } catch (error: any) {
    if (dev) {
      console.log('CLIENT: Login error code:', error.code);
      console.log('CLIENT: Login error message:', error.message);
    }
    
    // Handle different types of login errors
    if (error.code === 401) {
      if (dev) console.log('CLIENT: Invalid credentials (401)');
      throw new Error('Invalid email or password.');
    } else if (error.message && error.message.includes('prohibited when a session is active')) {
      if (dev) console.log('CLIENT: Session already active, checking current user');
      // We're already logged in but there was an issue with the redirect
      try {
        const currentUser = await getCurrentUser({ force: true });
        if (currentUser) {
          if (dev) console.log('CLIENT: Already logged in as:', currentUser.$id);
          goto('/dashboard');
          return true;
        } else {
          // Session conflict but can't get user - force logout and retry
          if (dev) console.log('CLIENT: Session conflict but no user, logging out and retrying');
          await logout(false); // Silent logout
          return login(email, password); // Retry login
        }
      } catch (innerError) {
        console.error('CLIENT: Error getting user for active session:', innerError);
        throw error;
      }
    } else {
      console.error('CLIENT: Error logging in:', error);
      throw error;
    }
  }
}

export async function logout(redirect = true) {
  try {
    if (dev) console.log('CLIENT: Logging out');
    
    // Set stores immediately for responsive UI
    user.set(null);
    isAuthenticated.set(false);
    
    try {
      // Updated for Appwrite SDK v17+
      await account.deleteSession('current');
      if (dev) console.log('CLIENT: Session deleted');
    } catch (e) {
      if (dev) console.log('CLIENT: Error deleting session (might already be invalid):', e);
      // Continue with cleanup even if session deletion fails
    }
    
    // Clean up all auth-related storage
    try {
      // Don't explicitly remove cookieFallback as Appwrite manages this
      // Just clear our custom cookie
      if (browser) {
        document.cookie = 'client_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      }
      if (dev) console.log('CLIENT: Cleaned up auth cookies');
    } catch (e) {
      if (dev) console.log('CLIENT: Error cleaning auth storage:', e);
    }
    
    // Reset auth check time
    lastAuthCheck = 0;
    
    // Redirect to login if requested
    if (redirect) {
      if (dev) console.log('CLIENT: Redirecting to login');
      goto('/login');
    }
    
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    
    // Ensure stores are reset even on error
    user.set(null);
    isAuthenticated.set(false);
    
    if (redirect) {
      goto('/login');
    }
    
    throw error;
  }
}

/**
 * Try to refresh the authentication session if it may have expired
 * @returns True if successfully refreshed, false otherwise
 */
export async function refreshAuth() {
  if (dev) console.log('CLIENT: Attempting to refresh auth session');
  isRefreshing.set(true);
  
  try {
    const currentUser = await account.get();
    if (currentUser) {
      if (dev) console.log('CLIENT: Auth session still valid');
      user.set(currentUser);
      isAuthenticated.set(true);
      lastAuthCheck = Date.now();
      return true;
    }
  } catch (error) {
    if (dev) console.log('CLIENT: Auth refresh failed:', error);
    // Session is invalid - clear state
    user.set(null);
    isAuthenticated.set(false);
  } finally {
    isRefreshing.set(false);
  }
  
  return false;
}
