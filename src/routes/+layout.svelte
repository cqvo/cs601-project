<script lang="ts">
	import '../app.css';
	import { getCurrentUser, logout, user as userStore } from '$lib/appwrite/auth';
	import { onMount } from 'svelte';
	import { Sun, Moon, LogIn, LogOut } from '@lucide/svelte';

	let { children, data } = $props();
	let darkMode = $state(false);
	let user = $derived(data.user || $userStore);

	function toggleDarkMode() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
	}

	async function handleLogout() {
		await logout();
	}

	// Check authentication status on mount
	onMount(() => {
		getCurrentUser();
		// Check system preference for dark mode
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			darkMode = true;
			document.documentElement.classList.add('dark');
		}
	});
</script>

<div class="flex min-h-screen flex-col">
	<header class="bg-surface-100-800-token border-surface-300-600-token border-b">
		<div class="container mx-auto flex items-center justify-between px-4 py-3">
			<a href="/" class="text-xl font-bold">Resume</a>

			<div class="flex items-center gap-4">
				{#if user}
					<button onclick={handleLogout}><LogOut size={18}/></button>
					{:else}
					<a href="/login"><LogIn size={18}/></a>
					{/if}
				<button
					type="button"
					class="bg-surface-200-700-token hover:bg-surface-300-600-token rounded-full p-2"
					onclick={toggleDarkMode}
					aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
				>
					{#if darkMode}
						<Sun size={18} />
					{:else}
						<Moon size={18} />
					{/if}
				</button>
			</div>
		</div>
	</header>

	<main class="container mx-auto flex-grow p-4">
		{@render children()}
	</main>

	<footer class="border-surface-300-600-token border-t py-6">
		<div class="container mx-auto px-4 text-center text-sm">
			<p>© {new Date().getFullYear()} WumboTech</p>
		</div>
	</footer>
</div>
