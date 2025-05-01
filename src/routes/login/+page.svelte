<script lang="ts">
	import { login, createAccount, isAuthenticated, user, getCurrentUser } from '$lib/appwrite/auth';
	import { goto } from '$app/navigation';
	import { LogIn, UserPlus, AlertCircle } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let isRegister = $state(false);
	let loading = $state(false);
	let error = $state('');

	onMount(async () => {
		// Check if user is already authenticated
		const currentUser = await getCurrentUser();
		
		// If authenticated, redirect to dashboard
		if (currentUser && $isAuthenticated) {
			goto('/dashboard');
		}
		// Otherwise, stay on login page (no need to do anything)
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			if (isRegister) {
				await createAccount(email, password, name);
			} else {
				await login(email, password);
			}
			goto('/dashboard');
		} catch (err: any) {
			error = err.message || 'An error occurred during authentication';
		} finally {
			loading = false;
		}
	}

	function toggleMode() {
		isRegister = !isRegister;
		error = '';
	}
</script>

<div class="flex min-h-[calc(100vh-10rem)] items-center justify-center">
	<div class="bg-surface-50-900-token w-full max-w-md rounded-lg p-6 shadow-lg">
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-2xl font-bold">
				{isRegister ? 'Create an Account' : 'Login to Resume CMS'}
			</h1>
			<p class="text-surface-600-300-token">
				{isRegister
					? 'Create your account to manage your resume'
					: 'Sign in to access your dashboard'}
			</p>
		</div>

		{#if error}
			<div class="bg-error-500/20 text-error-500 mb-6 flex items-start gap-2 rounded-lg p-3">
				<AlertCircle size={18} class="mt-0.5 flex-shrink-0" />
				<span>{error}</span>
			</div>
		{/if}

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }} class="space-y-4">
			{#if isRegister}
				<div>
					<label for="name" class="mb-1 block text-sm font-medium">Full Name</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						class="bg-surface-50-900-token w-full rounded-lg border p-3"
						placeholder="Enter your full name"
						required
					/>
				</div>
			{/if}

			<div>
				<label for="email" class="mb-1 block text-sm font-medium">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					class="bg-surface-50-900-token w-full rounded-lg border p-3"
					placeholder="Enter your email"
					required
				/>
			</div>

			<div>
				<label for="password" class="mb-1 block text-sm font-medium">Password</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					class="bg-surface-50-900-token w-full rounded-lg border p-3"
					placeholder="Enter your password"
					required
				/>
			</div>

			<button
				type="submit"
				class="bg-primary-500 hover:bg-primary-600 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
				disabled={loading}
			>
				{#if loading}
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
					></div>
					<span>{isRegister ? 'Creating Account...' : 'Logging in...'}</span>
				{:else if isRegister}
					<UserPlus size={18} />
					<span>Create Account</span>
				{:else}
					<LogIn size={18} />
					<span>Login</span>
				{/if}
			</button>
		</form>

		<div class="mt-6 text-center">
			<button onclick={toggleMode} class="text-primary-500 text-sm hover:underline">
				{isRegister
					? 'Already have an account? Login instead'
					: "Don't have an account? Create one"}
			</button>
		</div>
	</div>
</div>
