import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { databases, ID, Query } from './index';

// Define database constants that would normally be in a config file
const TEST_DATABASE_ID = 'test-database';
const TEST_COLLECTION_ID = 'resume-sections';

describe('Appwrite Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the listDocuments method for this test suite
    vi.mocked(databases.listDocuments).mockResolvedValue({
      documents: [
        { 
          $id: 'section-1', 
          title: 'Experience', 
          order: 1, 
          isVisible: true,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        },
        { 
          $id: 'section-2', 
          title: 'Education', 
          order: 2, 
          isVisible: true,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        }
      ],
      total: 2
    });
    
    // Mock the getDocument method
    vi.spyOn(databases, 'getDocument').mockImplementation((databaseId, collectionId, documentId) => {
      if (documentId === 'section-1') {
        return Promise.resolve({
          $id: 'section-1', 
          title: 'Experience', 
          order: 1, 
          isVisible: true,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        });
      }
      return Promise.reject(new Error('Document not found'));
    });
    
    // Mock the createDocument method
    vi.spyOn(databases, 'createDocument').mockImplementation((databaseId, collectionId, documentId, data) => {
      return Promise.resolve({
        $id: documentId || 'new-section-id',
        ...data,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      });
    });
    
    // Mock the updateDocument method
    vi.spyOn(databases, 'updateDocument').mockImplementation((databaseId, collectionId, documentId, data) => {
      return Promise.resolve({
        $id: documentId,
        ...data,
        $updatedAt: new Date().toISOString()
      });
    });
    
    // Mock the deleteDocument method
    vi.spyOn(databases, 'deleteDocument').mockResolvedValue({});
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  test('should list resume sections', async () => {
    const response = await databases.listDocuments(TEST_DATABASE_ID, TEST_COLLECTION_ID);
    
    expect(databases.listDocuments).toHaveBeenCalledWith(TEST_DATABASE_ID, TEST_COLLECTION_ID);
    expect(response.documents).toHaveLength(2);
    expect(response.documents[0].title).toBe('Experience');
    expect(response.documents[1].title).toBe('Education');
  });
  
  test('should fetch a single resume section', async () => {
    const response = await databases.getDocument(TEST_DATABASE_ID, TEST_COLLECTION_ID, 'section-1');
    
    expect(databases.getDocument).toHaveBeenCalledWith(TEST_DATABASE_ID, TEST_COLLECTION_ID, 'section-1');
    expect(response.$id).toBe('section-1');
    expect(response.title).toBe('Experience');
  });
  
  test('should create a new resume section', async () => {
    const newSection = {
      title: 'Skills',
      order: 3,
      isVisible: true
    };
    
    const response = await databases.createDocument(
      TEST_DATABASE_ID, 
      TEST_COLLECTION_ID, 
      ID.unique(), 
      newSection
    );
    
    expect(databases.createDocument).toHaveBeenCalledWith(
      TEST_DATABASE_ID, 
      TEST_COLLECTION_ID, 
      expect.any(String), 
      newSection
    );
    expect(response.title).toBe('Skills');
    expect(response.order).toBe(3);
    expect(response.isVisible).toBe(true);
    expect(response.$id).toBeDefined();
  });
  
  test('should update an existing resume section', async () => {
    const updatedData = {
      title: 'Professional Experience',
      isVisible: false
    };
    
    const response = await databases.updateDocument(
      TEST_DATABASE_ID, 
      TEST_COLLECTION_ID, 
      'section-1', 
      updatedData
    );
    
    expect(databases.updateDocument).toHaveBeenCalledWith(
      TEST_DATABASE_ID, 
      TEST_COLLECTION_ID, 
      'section-1', 
      updatedData
    );
    expect(response.$id).toBe('section-1');
    expect(response.title).toBe('Professional Experience');
    expect(response.isVisible).toBe(false);
    expect(response.$updatedAt).toBeDefined();
  });
  
  test('should delete a resume section', async () => {
    await databases.deleteDocument(TEST_DATABASE_ID, TEST_COLLECTION_ID, 'section-1');
    
    expect(databases.deleteDocument).toHaveBeenCalledWith(
      TEST_DATABASE_ID, 
      TEST_COLLECTION_ID, 
      'section-1'
    );
  });
  
  test('should query resume sections with filters', async () => {
    // Mock listDocuments specifically for this test
    vi.mocked(databases.listDocuments).mockResolvedValueOnce({
      documents: [
        { 
          $id: 'section-1', 
          title: 'Experience', 
          order: 1, 
          isVisible: true,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString()
        }
      ],
      total: 1
    });
    
    const response = await databases.listDocuments(
      TEST_DATABASE_ID, 
      TEST_COLLECTION_ID,
      [Query.equal('isVisible', true)]
    );
    
    expect(databases.listDocuments).toHaveBeenCalledWith(
      TEST_DATABASE_ID, 
      TEST_COLLECTION_ID,
      [Query.equal('isVisible', true)]
    );
    expect(response.documents).toHaveLength(1);
    expect(response.documents[0].isVisible).toBe(true);
  });
});