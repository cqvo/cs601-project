import { account } from '$lib/appwrite';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

// Handle function for managing authentication state
export const handle: Handle = async ({ event, resolve }) => {
	// Default to unauthenticated
	event.locals.user = null;
	event.locals.session = false;

	if (dev) console.log('SERVER: Checking auth state for:', event.url.pathname);

	// Always attempt to validate the session with Appwrite directly
	// instead of just checking for cookie presence
	try {
		// Try to get the current account info - this validates the session
		if (dev) console.log('SERVER: Validating session with Appwrite...');
		const user = await account.get();
		
		// Successfully retrieved user - we have a valid session
		if (dev) console.log('SERVER: Authentication successful for user:', user.$id);
		event.locals.user = user;
		event.locals.session = true;
		
		// Set a custom header that will be exposed to the frontend
		// This helps sync server and client auth states
		event.locals.authValidated = true;
	} catch (error: any) {
		if (dev) console.log('SERVER: Auth error code:', error.code);
		if (dev) console.log('SERVER: Auth error message:', error.message);
		
		// Handle permission scope errors gracefully
		if (error.code === 401) {
			if (dev) console.log('SERVER: Session invalid or expired');
			event.locals.authValidated = false;
		} else {
			if (dev) console.error('SERVER: Auth hook error:', error.message || error);
		}
		
		// Even if there's an error, check if it seems like there was a session
		// This helps with the redirect logic in layout.server.ts
		const cookies = event.request.headers.get('cookie') || '';
		const appwriteCookies = ['a_session', 'a_session_', 'a_session_legacy'];
		const hasAppwriteCookie = appwriteCookies.some(cookie => cookies.includes(cookie));
		event.locals.hadExpiredSession = hasAppwriteCookie;
	}

	if (dev) {
		console.log('SERVER: Auth state before resolving:', {
			path: event.url.pathname,
			isAuthenticated: event.locals.session,
			hasUser: !!event.locals.user,
			hadExpiredSession: !!event.locals.hadExpiredSession
		});
	}

	// Resolve the request
	const response = await resolve(event);
	
	// If we validated auth and have a user session, add a custom header
	// This helps the client know when server auth validation was successful
	if (event.locals.authValidated) {
		response.headers.append('X-Auth-Validated', 'true');
	}
	
	return response;
};
