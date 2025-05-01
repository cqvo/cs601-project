import { json } from '@sveltejs/kit';
import { account } from '$lib/appwrite';

export async function GET() {
    try {
        // Log all environment variables for debugging
        console.log('AUTH_CHECK: Checking server-side auth with Appwrite');
        
        try {
            const user = await account.get();
            console.log('AUTH_CHECK: Successfully authenticated user:', user.$id);
            return json({ authenticated: true, user });
        } catch (error: any) {
            console.log('AUTH_CHECK: Auth error code:', error.code);
            console.log('AUTH_CHECK: Auth error message:', error.message);
            return json({ 
                authenticated: false, 
                error: {
                    code: error.code,
                    message: error.message || 'Unknown error'
                }
            });
        }
    } catch (error) {
        console.error('AUTH_CHECK: Unexpected error:', error);
        return json({ 
            authenticated: false, 
            error: { message: 'Server error checking authentication' } 
        });
    }
}