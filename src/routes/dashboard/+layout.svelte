<script lang="ts">
	import { logout, user as userStore, isRefreshing, getCurrentUser, refreshAuth } from '$lib/appwrite/auth';
	import { LogOut, FileText, Settings, LayoutDashboard, Award, Loader2, RefreshCw } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { dev } from '$app/environment';

	let { children, data } = $props();
	let sidebarOpen = $state(false);
	let loading = $state(true);
	let authError = $state(false);
	
	// Use the server-provided user data if available, otherwise use client-side store
	let user = $derived(data.user || $userStore);
	
	// Check if auth was validated on the server
	const serverValidated = data.serverValidated;
	const potentialAuth = data.potentialAuth;
	
	// For periodic auth check - helps catch expiration before user actions
	let authCheckInterval: ReturnType<typeof setInterval> | null = null;

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	async function handleLogout() {
		await logout();
	}
	
	// Handle auth refresh when needed
	async function handleAuthRefresh() {
		if ($isRefreshing) return; // Prevent multiple simultaneous refreshes
		
		if (dev) console.log('DASHBOARD CLIENT: Auto refreshing auth state');
		
		try {
			const refreshed = await refreshAuth();
			if (refreshed) {
				if (dev) console.log('DASHBOARD CLIENT: Auth refresh successful');
				authError = false;
				return true;
			} else {
				if (dev) console.log('DASHBOARD CLIENT: Auth refresh failed - session invalid');
				authError = true;
				// Redirect to /login after failed refresh
				setTimeout(() => {
					const currentPath = window.location.pathname;
					goto(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
				}, 2000); // Brief delay to show error state
				return false;
			}
		} catch (error) {
			if (dev) console.error('DASHBOARD CLIENT: Error during auth refresh:', error);
			authError = true;
			return false;
		}
	}
	
	// Setup auth checking on intervals to catch expiration
	function setupAuthCheck() {
		// Clear any existing interval
		if (authCheckInterval) {
			clearInterval(authCheckInterval);
		}
		
		// Check auth every 5 minutes
		authCheckInterval = setInterval(async () => {
			if (dev) console.log('DASHBOARD CLIENT: Running periodic auth check');
			const user = await getCurrentUser({ quiet: true, force: true });
			if (!user) {
				if (dev) console.log('DASHBOARD CLIENT: Periodic check detected auth issue');
				await handleAuthRefresh();
			}
		}, 5 * 60 * 1000); // 5 minutes
	}

	onMount(async () => {
		if (dev) console.log('DASHBOARD CLIENT: Mounting dashboard layout');
		
		// Add server validation meta tag for future navigation
		if (serverValidated) {
			if (dev) console.log('DASHBOARD CLIENT: Server validated auth');
			const meta = document.createElement('meta');
			meta.name = 'auth-validated';
			meta.content = 'true';
			document.head.appendChild(meta);
			
			// If server validated auth, we can skip client check and show content immediately
			loading = false;
			setupAuthCheck();
			return;
		}
		
		// If the server indicated potential auth (expired session or client cookie),
		// try to refresh the auth state
		if (potentialAuth) {
			if (dev) console.log('DASHBOARD CLIENT: Potential auth detected, attempting refresh');
			const refreshed = await handleAuthRefresh();
			if (refreshed) {
				loading = false;
				setupAuthCheck();
				return;
			}
			// If refresh failed, we'll redirect in handleAuthRefresh
			return;
		}
		
		// Otherwise do a standard auth check
		if (dev) console.log('DASHBOARD CLIENT: Checking client-side auth');
		const currentUser = await getCurrentUser({ redirectToLogin: true, force: true });
		
		if (!currentUser) {
			if (dev) console.log('DASHBOARD CLIENT: No authentication, redirect handled by getCurrentUser');
			return;
		}
		
		if (dev) console.log('DASHBOARD CLIENT: Auth verified, showing dashboard');
		loading = false;
		setupAuthCheck();
	});
	
	onDestroy(() => {
		// Clean up interval on component destruction
		if (authCheckInterval) {
			clearInterval(authCheckInterval);
		}
	});
</script>

{#if loading}
	<div class="flex h-screen w-full items-center justify-center">
		<div class="flex flex-col items-center gap-4">
			<Loader2 size={40} class="animate-spin text-primary-500" />
			<p>Verifying authentication...</p>
		</div>
	</div>
{:else if authError}
	<div class="flex h-screen w-full items-center justify-center">
		<div class="flex flex-col items-center gap-4">
			<div class="text-error-500">
				<RefreshCw size={40} class="animate-spin" />
			</div>
			<p>Session expired. Redirecting to login...</p>
		</div>
	</div>
{:else}
	<div class="flex min-h-screen">
	<!-- Mobile sidebar toggle -->
	<button
		class="bg-primary-500 fixed right-4 bottom-4 z-20 rounded-full p-3 text-white shadow-lg md:hidden"
		onclick={toggleSidebar}
		aria-label="Toggle sidebar"
	>
		<LayoutDashboard size={20} />
	</button>

	<!-- Sidebar -->
	<aside
		class="border-surface-300-600-token bg-surface-100-800-token fixed inset-y-0 left-0 z-10 w-64 transform border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0 {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<div class="border-surface-300-600-token border-b p-4">
			<div class="text-xl font-semibold">Dashboard</div>
			{#if user}
				<div class="text-surface-600-300-token mt-1 truncate text-sm">
					{user.name || user.email}
				</div>
			{/if}
		</div>

		<nav class="space-y-1 p-4">
			<a
				href="/dashboard"
				class="text-surface-900-50-token hover:bg-surface-200-700-token flex items-center gap-3 rounded-lg px-4 py-2"
				aria-current={'/dashboard' === window.location.pathname ? 'page' : undefined}
				class:bg-surface-200-700-token={'/dashboard' === window.location.pathname}
			>
				<LayoutDashboard size={18} />
				<span>Overview</span>
			</a>

			<a
				href="/dashboard/resume"
				class="text-surface-900-50-token hover:bg-surface-200-700-token flex items-center gap-3 rounded-lg px-4 py-2"
				aria-current={'/dashboard/resume' === window.location.pathname ? 'page' : undefined}
				class:bg-surface-200-700-token={'/dashboard/resume' === window.location.pathname}
			>
				<FileText size={18} />
				<span>Resume Sections</span>
			</a>

			<a
				href="/dashboard/skills"
				class="text-surface-900-50-token hover:bg-surface-200-700-token flex items-center gap-3 rounded-lg px-4 py-2"
				aria-current={'/dashboard/skills' === window.location.pathname ? 'page' : undefined}
				class:bg-surface-200-700-token={'/dashboard/skills' === window.location.pathname}
			>
				<Award size={18} />
				<span>Skills</span>
			</a>

			<a
				href="/dashboard/settings"
				class="text-surface-900-50-token hover:bg-surface-200-700-token flex items-center gap-3 rounded-lg px-4 py-2"
				aria-current={'/dashboard/settings' === window.location.pathname ? 'page' : undefined}
				class:bg-surface-200-700-token={'/dashboard/settings' === window.location.pathname}
			>
				<Settings size={18} />
				<span>Settings</span>
			</a>
		</nav>

		<div class="absolute right-0 bottom-0 left-0 p-4">
			<button
				onclick={handleLogout}
				class="bg-surface-200-700-token text-surface-900-50-token hover:bg-surface-300-600-token flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2"
			>
				<LogOut size={18} />
				<span>Logout</span>
			</button>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex-1 overflow-auto">
		<!-- Backdrop for mobile sidebar -->
		{#if sidebarOpen}
			<div
				class="bg-opacity-50 fixed inset-0 z-0 bg-black md:hidden"
				onclick={toggleSidebar}
				aria-hidden="true"
			></div>
		{/if}

		<div class="mx-auto max-w-6xl p-6">
			{@render children()}
		</div>
	</div>
</div>
{/if}