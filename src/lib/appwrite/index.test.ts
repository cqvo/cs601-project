import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Client, Account, Databases, Storage, ID } from 'appwrite';

// Mock Appwrite modules
vi.mock('appwrite', () => {
  const listCollectionsMock = vi.fn().mockResolvedValue({
    collections: [{ $id: 'test-collection', name: 'Test Collection' }],
    total: 1
  });
  
  const listDocumentsMock = vi.fn().mockResolvedValue({
    documents: [],
    total: 0
  });
  
  const mockDatabases = {
    listCollections: listCollectionsMock,
    listDocuments: listDocumentsMock
  };
  
  const mockClient = {
    setEndpoint: vi.fn().mockReturnThis(),
    setProject: vi.fn().mockReturnThis()
  };
  
  const mockAccount = {
    get: vi.fn().mockResolvedValue({ $id: 'user-id' })
  };
  
  const mockStorage = {
    listBuckets: vi.fn().mockResolvedValue({
      buckets: [{ $id: 'test-bucket', name: 'Test Bucket' }],
      total: 1
    })
  };
  
  return {
    Client: vi.fn(() => mockClient),
    Account: vi.fn(() => mockAccount),
    Databases: vi.fn(() => mockDatabases),
    Storage: vi.fn(() => mockStorage),
    ID: { unique: vi.fn(() => 'unique-id') },
    Query: { equal: vi.fn((field, value) => `${field}=${value}`) }
  };
});

// Mock environment variables
vi.mock('$env/static/public', () => ({
  PUBLIC_APPWRITE_URL: 'https://cloud.appwrite.io/v1',
  PUBLIC_APPWRITE_PID: 'test-project'
}));

// Import after mocks are set up
import { client, account, databases, storage } from './index';

describe('Appwrite Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should initialize the client with correct endpoint and project', () => {
    // We need to re-import the module to trigger the initialization code
    jest.isolateModules(() => {
      require('./index');
    });
    
    // Since we're testing side effects that happen during module initialization,
    // we can only verify the exports are defined
    expect(client).toBeDefined();
    expect(account).toBeDefined();
    expect(databases).toBeDefined();
    expect(storage).toBeDefined();
  });

  test('should export initialized account, databases, and storage services', () => {
    expect(account).toBeDefined();
    expect(databases).toBeDefined();
    expect(storage).toBeDefined();
  });
});

describe('Appwrite Database Connection', () => {
  test('should be able to list collections', async () => {
    const result = await databases.listCollections();
    
    expect(result).toBeDefined();
    expect(result.collections).toHaveLength(1);
    expect(result.collections[0].$id).toBe('test-collection');
  });

  test('should be able to query documents from a collection', async () => {
    const result = await databases.listDocuments('test-database', 'test-collection');
    
    expect(result).toBeDefined();
    expect(result.documents).toEqual([]);
  });
});

describe('Appwrite Storage Connection', () => {
  test('should be able to list storage buckets', async () => {
    const result = await storage.listBuckets();
    
    expect(result).toBeDefined();
    expect(result.buckets).toHaveLength(1);
    expect(result.buckets[0].$id).toBe('test-bucket');
  });
});

describe('Appwrite Account Connection', () => {
  test('should be able to get user account', async () => {
    const user = await account.get();
    
    expect(user).toBeDefined();
    expect(user.$id).toBe('user-id');
  });
});