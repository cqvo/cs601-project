import { storage, ID } from './index';

// This would come from environment variables or constants in a real app
const BUCKET_ID = 'resumeFiles';

export async function uploadFile(file: File) {
	try {
		const response = await storage.createFile(BUCKET_ID, ID.unique(), file);
		return {
			id: response.$id,
			name: response.name,
			size: response.size,
			mimeType: response.mimeType,
			url: getFilePreview(response.$id)
		};
	} catch (error) {
		console.error('Error uploading file:', error);
		throw error;
	}
}

export function getFilePreview(fileId: string) {
	return storage.getFilePreview(BUCKET_ID, fileId);
}

export function getFileDownload(fileId: string) {
	return storage.getFileDownload(BUCKET_ID, fileId);
}

export async function deleteFile(fileId: string) {
	try {
		await storage.deleteFile(BUCKET_ID, fileId);
		return true;
	} catch (error) {
		console.error('Error deleting file:', error);
		throw error;
	}
}
