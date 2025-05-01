import { databases, ID, Query } from './index';

// These would come from environment variables or constants in a real app
const DATABASE_ID = 'resume';
const SECTIONS_COLLECTION = 'sections';
const ENTRIES_COLLECTION = 'entries';
const SKILLS_COLLECTION = 'skills';

export interface Section {
	$id: string;
	title: string;
	slug: string;
	description?: string;
	order: number;
	isVisible: boolean;
	iconName?: string;
	$updatedAt: Date;
}

export type NewSection = Omit<Section, '$id' | '$updatedAt'>;

export interface Entry {
	$id: string;
	sectionId: string;
	title: string;
	subtitle?: string;
	description?: string;
	startDate?: string;
	endDate?: string;
	isVisible: boolean;
	order: number;
}

export interface Skill {
	$id: string;
	name: string;
	level: number; // 1-5
	category: string;
	isVisible: boolean;
	order: number;
}

// Sections CRUD
export async function getSections() {
	try {
		const response = await databases.listDocuments(DATABASE_ID, SECTIONS_COLLECTION, [
			Query.orderAsc('order')
		]);
		return response.documents as unknown as Section[];
	} catch (error) {
		console.error('Error fetching sections:', error);
		throw error;
	}
}

export async function getVisibleSections() {
	try {
		const response = await databases.listDocuments(DATABASE_ID, SECTIONS_COLLECTION, [
			Query.equal('isVisible', true),
			Query.orderAsc('order')
		]);
		return response.documents as unknown as Section[];
	} catch (error) {
		console.error('Error fetching visible sections:', error);
		throw error;
	}
}

export async function createSection(section: NewSection) {
	try {
		const response = await databases.createDocument(
			DATABASE_ID,
			SECTIONS_COLLECTION,
			ID.unique(),
			section
		);
		return response as unknown as Section;
	} catch (error) {
		console.error('Error creating section:', error);
		throw error;
	}
}

export async function updateSection(
	id: string,
	section: Partial<NewSection>
) {
	try {
		const response = await databases.updateDocument(
			DATABASE_ID,
			SECTIONS_COLLECTION,
			id,
			section
		);
		return response as unknown as Section;
	} catch (error) {
		console.error('Error updating section:', error);
		throw error;
	}
}

export async function deleteSection(id: string) {
	try {
		await databases.deleteDocument(DATABASE_ID, SECTIONS_COLLECTION, id);
		return true;
	} catch (error) {
		console.error('Error deleting section:', error);
		throw error;
	}
}

// Entries CRUD
export async function getEntries(sectionId?: string) {
	try {
		const queries = [Query.orderAsc('order')];
		if (sectionId) {
			queries.push(Query.equal('sectionId', sectionId));
		}

		const response = await databases.listDocuments(DATABASE_ID, ENTRIES_COLLECTION, queries);
		return response.documents as unknown as Entry[];
	} catch (error) {
		console.error('Error fetching entries:', error);
		throw error;
	}
}

export async function getVisibleEntries(sectionId?: string) {
	try {
		const queries = [Query.equal('isVisible', true), Query.orderAsc('order')];

		if (sectionId) {
			queries.push(Query.equal('sectionId', sectionId));
		}

		const response = await databases.listDocuments(DATABASE_ID, ENTRIES_COLLECTION, queries);
		return response.documents as unknown as Entry[];
	} catch (error) {
		console.error('Error fetching visible entries:', error);
		throw error;
	}
}

export async function createEntry(entry: Omit<Entry, 'id'>) {
	try {
		const response = await databases.createDocument(
			DATABASE_ID,
			ENTRIES_COLLECTION,
			ID.unique(),
			entry
		);
		return response as unknown as Entry;
	} catch (error) {
		console.error('Error creating entry:', error);
		throw error;
	}
}

export async function updateEntry(id: string, entry: Partial<Omit<Entry, 'id'>>) {
	try {
		const response = await databases.updateDocument(
			DATABASE_ID,
			ENTRIES_COLLECTION,
			id,
			entry
		);
		return response as unknown as Entry;
	} catch (error) {
		console.error('Error updating entry:', error);
		throw error;
	}
}

export async function deleteEntry(id: string) {
	try {
		await databases.deleteDocument(DATABASE_ID, ENTRIES_COLLECTION, id);
		return true;
	} catch (error) {
		console.error('Error deleting entry:', error);
		throw error;
	}
}

// Skills CRUD
export async function getSkills(category?: string) {
	try {
		const queries = [Query.orderAsc('order')];
		if (category) {
			queries.push(Query.equal('category', category));
		}

		const response = await databases.listDocuments(DATABASE_ID, SKILLS_COLLECTION, queries);
		return response.documents as unknown as Skill[];
	} catch (error) {
		console.error('Error fetching skills:', error);
		throw error;
	}
}

export async function getVisibleSkills(category?: string) {
	try {
		const queries = [Query.equal('isVisible', true), Query.orderAsc('order')];

		if (category) {
			queries.push(Query.equal('category', category));
		}

		const response = await databases.listDocuments(DATABASE_ID, SKILLS_COLLECTION, queries);
		return response.documents as unknown as Skill[];
	} catch (error) {
		console.error('Error fetching visible skills:', error);
		throw error;
	}
}

export async function createSkill(skill: Omit<Skill, 'id'>) {
	try {
		const response = await databases.createDocument(
			DATABASE_ID,
			SKILLS_COLLECTION,
			ID.unique(),
			skill
		);
		return response as unknown as Skill;
	} catch (error) {
		console.error('Error creating skill:', error);
		throw error;
	}
}

export async function updateSkill(id: string, skill: Partial<Omit<Skill, 'id'>>) {
	try {
		const response = await databases.updateDocument(
			DATABASE_ID,
			SKILLS_COLLECTION,
			id,
			skill
		);
		return response as unknown as Skill;
	} catch (error) {
		console.error('Error updating skill:', error);
		throw error;
	}
}

export async function deleteSkill(id: string) {
	try {
		await databases.deleteDocument(DATABASE_ID, SKILLS_COLLECTION, id);
		return true;
	} catch (error) {
		console.error('Error deleting skill:', error);
		throw error;
	}
}
