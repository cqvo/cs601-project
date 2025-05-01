<script lang="ts">
	import '../app.css';
	import { getCurrentUser } from '$lib/appwrite/auth';
	import { onMount } from 'svelte';
	import { Sun, Moon } from '@lucide/svelte';

	let { children } = $props();
	let darkMode = $state(false);

	function toggleDarkMode() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
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

<div class="flex min-h-screen flex-col" data-theme="skeleton">
	<header class="bg-surface-100-800-token border-surface-300-600-token border-b">
		<div class="container mx-auto flex items-center justify-between px-4 py-3">
			<a href="/" class="text-xl font-bold">Resume CMS</a>

			<div class="flex items-center gap-4">
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
			<p>© {new Date().getFullYear()} Resume CMS</p>
		</div>
	</footer>
</div>
