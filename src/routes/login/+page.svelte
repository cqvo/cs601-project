<script lang="ts">
	import { account, ID } from '$lib/appwrite';

	let loggedInUser = null;

	async function login(email, password) {
		await account.createEmailPasswordSession(email, password);
		loggedInUser = await account.get();
	}

	async function register(email, password) {
		await account.create(ID.unique(), email, password);
		login(email, password);
	}

	function submit(e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		const type = e.submitter.dataset.type;

		if (type === "login") {
			login(formData.get('email'), formData.get('password'));
		} else if (type === "register") {
			register(formData.get('email'), formData.get('password'));
		}
	}

	async function logout() {
		await account.deleteSession('current');
		loggedInUser = null;
	}
</script>

<p>
	{loggedInUser ? `Logged in as ${loggedInUser.name}` : 'Not logged in'}
</p>

<form onsubmit={submit}>
	<input type="email" placeholder="Email" name="email" required />
	<input type="password" placeholder="Password" name="password" required />

	<button type="submit" data-type="login">Login</button>
	<button type="submit" data-type="register">Register</button>
</form>

<button onclick={logout}>Logout</button>