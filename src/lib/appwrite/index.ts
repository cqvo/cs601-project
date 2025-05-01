import { Client, Account, Databases, Storage } from 'appwrite';
import { PUBLIC_APPWRITE_URL, PUBLIC_APPWRITE_PID } from '$env/static/public';

export const client = new Client();

client.setEndpoint(PUBLIC_APPWRITE_URL).setProject(PUBLIC_APPWRITE_PID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query } from 'appwrite';
