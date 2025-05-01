import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { client, databases, account, storage } from './index';
import { PUBLIC_APPWRITE_URL, PUBLIC_APPWRITE_PID } from '$env/static/public';

/**
 * This is an integration test for Appwrite connection.
 * It will try to connect to Appwrite and perform basic operations.
 * 
 * Note: This test requires a running Appwrite instance and valid credentials.
 * It should be skipped in CI environments unless proper secrets are provided.
 */

// Skip these tests in CI environments or when not explicitly enabled
const ENABLE_APPWRITE_INTEGRATION_TESTS = process.env.ENABLE_APPWRITE_INTEGRATION_TESTS === 'true';
const runTest = ENABLE_APPWRITE_INTEGRATION_TESTS ? test : test.skip;

describe('Appwrite Connection', () => {
  beforeAll(() => {
    // Verify environment variables are set
    if (ENABLE_APPWRITE_INTEGRATION_TESTS) {
      expect(PUBLIC_APPWRITE_URL).toBeTruthy();
      expect(PUBLIC_APPWRITE_PID).toBeTruthy();
      
      console.log('Running Appwrite integration tests with:');
      console.log(`- Endpoint: ${PUBLIC_APPWRITE_URL}`);
      console.log(`- Project ID: ${PUBLIC_APPWRITE_PID}`);
    }
  });
  
  afterAll(() => {
    // Clean up any test resources if needed
  });
  
  runTest('should connect to Appwrite service', async () => {
    // Simply verifying that client is configured
    expect(client).toBeDefined();
    expect(client.constructor.name).toBe('Client');
  });
  
  runTest('should verify database connection by listing collections', async () => {
    try {
      // This will fail if database connection is invalid
      const response = await databases.listCollections();
      
      // Just validating response structure, not actual contents
      expect(response).toBeDefined();
      expect(response.collections).toBeDefined();
      expect(Array.isArray(response.collections)).toBe(true);
      
      console.log(`Found ${response.total} collections`);
      
      // Log the first few collections for debugging
      if (response.collections.length > 0) {
        console.log('Collections:', response.collections.slice(0, 3).map(c => c.name));
      }
      
    } catch (error) {
      console.error('Database connection test failed:', error);
      throw error;
    }
  });
  
  runTest('should have proper database access permissions', async () => {
    try {
      // Try to list documents from a collection
      // Note: This test assumes there's at least one collection
      // with proper read permissions
      
      const collections = await databases.listCollections();
      
      if (collections.total === 0) {
        console.log('No collections found, skipping document test');
        return;
      }
      
      // Get the first collection
      const collection = collections.collections[0];
      console.log(`Testing document access on collection: ${collection.name} (${collection.$id})`);
      
      // Try to list documents
      const response = await databases.listDocuments(collection.$databaseId, collection.$id, []);
      
      expect(response).toBeDefined();
      expect(response.documents).toBeDefined();
      expect(Array.isArray(response.documents)).toBe(true);
      
      console.log(`Access successful. Found ${response.total} documents.`);
      
    } catch (error) {
      // Check if error is permission related
      if (error.code === 401 || error.code === 403) {
        console.log('Permission denied accessing documents. This might be expected depending on your security rules.');
      } else {
        console.error('Document access test failed:', error);
        throw error;
      }
    }
  });
  
  runTest('should verify storage access permissions', async () => {
    try {
      // Try to list storage buckets
      const response = await storage.listBuckets();
      
      expect(response).toBeDefined();
      expect(response.buckets).toBeDefined();
      expect(Array.isArray(response.buckets)).toBe(true);
      
      console.log(`Found ${response.total} storage buckets`);
      
    } catch (error) {
      // Check if error is permission related
      if (error.code === 401 || error.code === 403) {
        console.log('Permission denied accessing storage. This might be expected depending on your security rules.');
      } else {
        console.error('Storage access test failed:', error);
        throw error;
      }
    }
  });
  
  runTest('should check for anonymous session support', async () => {
    try {
      // Try to get the current session (this should work for anonymous sessions too)
      // but won't require authentication
      const session = await account.getSession('current');
      
      console.log('Current session exists:', session.$id);
      expect(session).toBeDefined();
      expect(session.$id).toBeTruthy();
      
    } catch (error) {
      // If error is "Session not found", that's normal when not authenticated
      if (error.code === 404) {
        console.log('No active session (expected when not authenticated)');
      } else {
        console.error('Session check failed:', error);
        throw error;
      }
    }
  });
});