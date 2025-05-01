import { Client, Account } from 'appwrite';
import { PUBLIC_APPWRITE_URL, PUBLIC_APPWRITE_PID } from '$env/static/public';

export const client = new Client();

client
	.setEndpoint(PUBLIC_APPWRITE_URL)
	.setProject(PUBLIC_APPWRITE_PID); // Replace with your project ID

export const account = new Account(client);
export { ID } from 'appwrite';