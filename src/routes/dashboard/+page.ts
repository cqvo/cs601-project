import { redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { isAuthenticated, getCurrentUser } from '$lib/appwrite/auth';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
  // Check authentication on the client-side as well
  const currentUser = await getCurrentUser();
  
  // If not authenticated, redirect to /login
  if (!currentUser || !get(isAuthenticated)) {
    // Redirect with 303 to ensure using GET for the login page
    redirect(303, '/login');
  }
  
  // User is authenticated - provide an empty return
  // The actual user data comes from the server-side load function
  return {};
};