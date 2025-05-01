<script lang="ts">
	import { user } from '$lib/appwrite/services';
	import { account } from '$lib/appwrite/index';
	import { onMount } from 'svelte';
	import { Loader2, Save, AlertCircle, Check } from '@lucide/svelte';

	let name = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state('');

	onMount(() => {
		if ($user) {
			name = $user.name || '';
		}
	});

	async function updateProfile() {
		if (!name.trim()) return;

		try {
			loading = true;
			error = '';
			success = '';

			await account.updateName(name.trim());
			success = 'Profile updated successfully!';

			// Update the user store
			const updatedUser = await account.get();
			user.set(updatedUser);
		} catch (err: any) {
			error = err.message || 'Failed to update profile';
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-2xl space-y-8">
	<h1 class="text-3xl font-bold">Account Settings</h1>

	{#if error}
		<div class="bg-error-500/20 text-error-500 flex items-center gap-2 rounded-lg p-4">
			<AlertCircle size={18} />
			<span>{error}</span>
		</div>
	{/if}

	{#if success}
		<div class="bg-success-500/20 text-success-500 flex items-center gap-2 rounded-lg p-4">
			<Check size={18} />
			<span>{success}</span>
		</div>
	{/if}

	<div class="bg-surface-50-900-token rounded-lg p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold">Profile Information</h2>

		<form onsubmit={(e) => { e.preventDefault(); updateProfile(); }} class="space-y-6">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium">Full Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					class="bg-surface-50-900-token w-full rounded-lg border p-3"
					placeholder="Your full name"
				/>
			</div>

			{#if $user}
				<div>
					<label class="mb-1 block text-sm font-medium">Email Address</label>
					<div
						class="bg-surface-200-700-token text-surface-600-300-token w-full rounded-lg border p-3"
					>
						{$user.email}
					</div>
					<p class="text-surface-600-300-token mt-1 text-xs">Email cannot be changed</p>
				</div>
			{/if}

			<div class="pt-2">
				<button
					type="submit"
					class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white"
					disabled={loading || !name.trim()}
				>
					{#if loading}
						<Loader2 size={18} class="animate-spin" />
					{:else}
						<Save size={18} />
					{/if}
					<span>Save Changes</span>
				</button>
			</div>
		</form>
	</div>
</div>
