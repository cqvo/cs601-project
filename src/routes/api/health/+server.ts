import { json } from '@sveltejs/kit';
import { checkAppwriteConnection, healthCheck } from '$lib/appwrite/connection';

/**
 * API health check endpoint that verifies Appwrite connection
 * Useful for monitoring and deployment validation
 */
export async function GET() {
  try {
    // Check the database connection
    const isHealthy = await healthCheck();
    
    // Get detailed connection status
    const connectionStatus = await checkAppwriteConnection();
    
    // Return health status
    return json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      appwrite: connectionStatus,
      uptime: process.uptime()
    }, {
      status: isHealthy ? 200 : 503
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    
    return json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error occurred',
      uptime: process.uptime()
    }, {
      status: 503
    });
  }
}