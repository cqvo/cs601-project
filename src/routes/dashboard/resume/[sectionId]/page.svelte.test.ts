import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';
import SectionEntryPage from './+page.svelte';
import * as appwriteServices from '$lib/appwrite/services';
import { goto } from '$app/navigation';

// Mock the $app/stores module
vi.mock('$app/stores', () => {
  return {
    page: {
      subscribe: (callback) => {
        callback({ params: { sectionId: 'test-section-id' } });
        return () => {};
      }
    }
  };
});

// Mock the $app/navigation module
vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

// Mock the services
vi.mock('$lib/appwrite/services', () => ({
  getSections: vi.fn(),
  getEntries: vi.fn(),
  createEntry: vi.fn(),
  updateEntry: vi.fn(),
  deleteEntry: vi.fn()
}));

// Mock data
const mockSection = {
  $id: 'test-section-id',
  title: 'Experience',
  order: 1,
  isVisible: true,
  $createdAt: '2023-01-01T00:00:00.000Z',
  $updatedAt: '2023-01-02T00:00:00.000Z'
};

const mockEntries = [
  {
    $id: 'entry-1',
    sectionId: 'test-section-id',
    title: 'Software Engineer',
    subtitle: 'Tech Company',
    description: 'Developed applications',
    startDate: '2020-01-01',
    endDate: '2022-01-01',
    isVisible: true,
    order: 0,
    $createdAt: '2023-01-01T00:00:00.000Z',
    $updatedAt: '2023-01-02T00:00:00.000Z'
  },
  {
    $id: 'entry-2',
    sectionId: 'test-section-id',
    title: 'Junior Developer',
    subtitle: 'Tech Startup',
    description: 'Built websites',
    startDate: '2018-01-01',
    endDate: '2020-01-01',
    isVisible: false,
    order: 1,
    $createdAt: '2023-01-01T00:00:00.000Z',
    $updatedAt: '2023-01-02T00:00:00.000Z'
  }
];

describe('SectionEntry Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(appwriteServices.getSections).mockResolvedValue([mockSection]);
    vi.mocked(appwriteServices.getEntries).mockResolvedValue(mockEntries);
    vi.mocked(appwriteServices.createEntry).mockResolvedValue({...mockEntries[0], $id: 'new-entry-id'});
    vi.mocked(appwriteServices.updateEntry).mockResolvedValue({...mockEntries[0], title: 'Updated Title'});
    vi.mocked(appwriteServices.deleteEntry).mockResolvedValue(true);
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  test('should render section title and entries', async () => {
    render(SectionEntryPage);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getByText('Experience Entries')).toBeInTheDocument();
    });
    
    // Check that the entries are rendered
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Company')).toBeInTheDocument();
    expect(screen.getByText('Junior Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Startup')).toBeInTheDocument();
    
    // Check that the back button is rendered
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/dashboard/resume');
  });
  
  test('should show loading state', () => {
    // Mock delayed response to show loading state
    vi.mocked(appwriteServices.getSections).mockImplementation(() => {
      return new Promise(resolve => setTimeout(() => resolve([mockSection]), 500));
    });
    
    render(SectionEntryPage);
    
    // Check that loading indicator is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  test('should handle section not found', async () => {
    // Mock empty sections array to simulate section not found
    vi.mocked(appwriteServices.getSections).mockResolvedValue([]);
    
    render(SectionEntryPage);
    
    await waitFor(() => {
      expect(screen.getByText('Section Not Found')).toBeInTheDocument();
    });
  });
  
  test('should display error message when fetch fails', async () => {
    // Mock error response
    vi.mocked(appwriteServices.getSections).mockRejectedValue(new Error('Failed to fetch'));
    
    render(SectionEntryPage);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load section data/i)).toBeInTheDocument();
    });
  });
  
  test('should open new entry form when "Add Entry" is clicked', async () => {
    render(SectionEntryPage);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Experience Entries')).toBeInTheDocument();
    });
    
    // Click the "Add Entry" button
    const addButton = screen.getByRole('button', { name: /add entry/i });
    await fireEvent.click(addButton);
    
    // Check that the form is displayed
    expect(screen.getByText('Add New Entry')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subtitle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
  
  test('should create a new entry when form is submitted', async () => {
    render(SectionEntryPage);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Experience Entries')).toBeInTheDocument();
    });
    
    // Click the "Add Entry" button
    const addButton = screen.getByRole('button', { name: /add entry/i });
    await fireEvent.click(addButton);
    
    // Fill the form
    const titleInput = screen.getByLabelText(/title \*/i);
    const subtitleInput = screen.getByLabelText(/subtitle/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    await fireEvent.input(titleInput, { target: { value: 'New Position' } });
    await fireEvent.input(subtitleInput, { target: { value: 'New Company' } });
    await fireEvent.input(descriptionInput, { target: { value: 'New Description' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add entry$/i });
    await fireEvent.click(submitButton);
    
    // Check that createEntry was called with correct data
    await waitFor(() => {
      expect(appwriteServices.createEntry).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Position',
        subtitle: 'New Company',
        description: 'New Description',
        sectionId: 'test-section-id'
      }));
    });
    
    // Check that loadSectionData was called after creation
    expect(appwriteServices.getSections).toHaveBeenCalledTimes(2);
    expect(appwriteServices.getEntries).toHaveBeenCalledTimes(2);
  });
  
  test('should edit an entry when edit button is clicked', async () => {
    render(SectionEntryPage);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Experience Entries')).toBeInTheDocument();
    });
    
    // Click edit button for the first entry
    const editButtons = screen.getAllByRole('button', { name: /edit entry/i });
    await fireEvent.click(editButtons[0]);
    
    // Verify edit form is shown
    const titleInput = screen.getByDisplayValue('Software Engineer');
    expect(titleInput).toBeInTheDocument();
    
    // Edit the title
    await fireEvent.input(titleInput, { target: { value: 'Senior Engineer' } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    await fireEvent.click(saveButton);
    
    // Check that updateEntry was called with correct data
    await waitFor(() => {
      expect(appwriteServices.updateEntry).toHaveBeenCalledWith(
        'entry-1',
        expect.objectContaining({
          title: 'Senior Engineer'
        })
      );
    });
  });
  
  test('should toggle entry visibility when visibility button is clicked', async () => {
    render(SectionEntryPage);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Experience Entries')).toBeInTheDocument();
    });
    
    // Get all visibility toggle buttons
    const visibilityButtons = screen.getAllByRole('button', { name: /(hide|show) entry/i });
    
    // Click the first visibility button (hide)
    await fireEvent.click(visibilityButtons[0]);
    
    // Check that updateEntry was called with isVisible: false
    await waitFor(() => {
      expect(appwriteServices.updateEntry).toHaveBeenCalledWith(
        'entry-1',
        expect.objectContaining({
          isVisible: false
        })
      );
    });
  });
  
  test('should delete an entry when delete button is clicked and confirmed', async () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);
    
    render(SectionEntryPage);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Experience Entries')).toBeInTheDocument();
    });
    
    // Get all delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /delete entry/i });
    
    // Click the first delete button
    await fireEvent.click(deleteButtons[0]);
    
    // Check that confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this entry?');
    
    // Check that deleteEntry was called with correct ID
    await waitFor(() => {
      expect(appwriteServices.deleteEntry).toHaveBeenCalledWith('entry-1');
    });
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });
  
  test('should not delete an entry when delete is cancelled', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => false);
    
    render(SectionEntryPage);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Experience Entries')).toBeInTheDocument();
    });
    
    // Get all delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /delete entry/i });
    
    // Click the first delete button
    await fireEvent.click(deleteButtons[0]);
    
    // Check that confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this entry?');
    
    // Check that deleteEntry was NOT called
    expect(appwriteServices.deleteEntry).not.toHaveBeenCalled();
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });
});