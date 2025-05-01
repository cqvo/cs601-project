import { client, databases, storage } from './index';

/**
 * Connection status result with details about which services are connected
 */
export interface ConnectionStatus {
  isConnected: boolean;
  services: {
    database: boolean;
    storage: boolean;
  };
  error?: {
    message: string;
    code?: number;
  };
}

/**
 * Check the Appwrite connection status by verifying each service
 * This can be used for health checks or connection validation
 */
export async function checkAppwriteConnection(): Promise<ConnectionStatus> {
  const status: ConnectionStatus = {
    isConnected: false,
    services: {
      database: false,
      storage: false
    }
  };

  try {
    // Check database connection
    try {
      const dbResult = await databases.listDocuments('resume','sections');
      status.services.database = true;
    } catch (dbError: any) {
      console.error('Database connection check failed:', dbError);
      // Don't set error since we're just checking individual services
    }

    // Check storage connection
    try {
      const storageResult = await storage.listBuckets();
      status.services.storage = true;
    } catch (storageError: any) {
      console.error('Storage connection check failed:', storageError);
      // Don't set error since we're just checking individual services
    }

    // Overall connection is valid if at least one service is connected
    status.isConnected = status.services.database || status.services.storage;

    return status;
  } catch (error: any) {
    // This would be a more general error with the client connection
    console.error('Appwrite connection check failed:', error);
    return {
      isConnected: false,
      services: {
        database: false,
        storage: false
      },
      error: {
        message: error.message || 'Failed to connect to Appwrite',
        code: error.code
      }
    };
  }
}

/**
 * Performs a simple healthcheck to verify database connectivity
 * Returns true if connection is healthy, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // Simple check if we can list collections
    await databases.listCollections();
    return true;
  } catch (error) {
    console.error('Appwrite healthcheck failed:', error);
    return false;
  }
}

/**
 * Get database stats for monitoring purposes
 */
export async function getDatabaseStats() {
  try {
    const collections = await databases.listCollections();
    
    // Collect document counts for each collection (up to 5 collections)
    const collectionStats = await Promise.all(
      collections.collections
        .slice(0, 5)
        .map(async (collection) => {
          try {
            const docs = await databases.listDocuments(
              collection.$databaseId, 
              collection.$id,
              [],
              1
            );
            
            return {
              id: collection.$id,
              name: collection.name,
              documentCount: docs.total
            };
          } catch (error) {
            return {
              id: collection.$id,
              name: collection.name,
              documentCount: 'Access denied'
            };
          }
        })
    );
    
    return {
      totalCollections: collections.total,
      collectionStats
    };
  } catch (error: any) {
    console.error('Failed to get database stats:', error);
    throw new Error(`Database stats error: ${error.message}`);
  }
}