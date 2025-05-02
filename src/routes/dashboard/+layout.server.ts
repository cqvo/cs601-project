import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { dev } from '$app/environment';

// Server-side auth check to protect dashboard routes
export const load: LayoutServerLoad = async ({ locals, url, request }) => {
	const session = locals.session;
	const user = locals.user;
	const authValidated = locals.authValidated;
	const hadExpiredSession = locals.hadExpiredSession;

	if (dev) {
		console.log('DASHBOARD SERVER: Checking auth for route:', url.pathname);
		console.log('DASHBOARD SERVER: Session exists:', !!session);
		console.log('DASHBOARD SERVER: User exists:', !!user);
		console.log('DASHBOARD SERVER: Auth validated:', authValidated);
		console.log('DASHBOARD SERVER: Had expired session:', hadExpiredSession);
	}
	
	// If we have a validated session and user from the server hook, we're authenticated
	if (session && user && authValidated) {
		if (dev) console.log('DASHBOARD SERVER: Server-side auth validation passed');
		
		// Return auth state and a flag to let client know auth was validated server-side
		return { 
			user,
			serverValidated: true 
		};
	}
	
	// Check for client-side auth cookie, which might indicate valid auth state on client
	const cookies = request.headers.get('cookie') || '';
	const hasClientAuthCookie = cookies.includes('client_logged_in=true');
	
	if (dev) {
		console.log('DASHBOARD SERVER: Has client auth cookie:', hasClientAuthCookie);
	}
	
	// If we have evidence the client thinks it's authenticated (client cookie)
	// OR we found evidence of an expired session, let the client try to revalidate
	if (hasClientAuthCookie || hadExpiredSession) {
		if (dev) console.log('DASHBOARD SERVER: Potential auth state detected, deferring to client');
		
		// Return with a flag indicating we have indications of potential auth
		return { 
			user: null,
			serverValidated: false,
			potentialAuth: true
		};
	}
	
	// If we get here, there's no indication of authentication at all
	if (dev) console.log('DASHBOARD SERVER: No auth indications, redirecting to login');
	
	// Redirect to /login with the current path for redirect after login
	const encodedRedirect = encodeURIComponent(url.pathname);
	redirect(303, `/login?redirectTo=${encodedRedirect}`);
};
