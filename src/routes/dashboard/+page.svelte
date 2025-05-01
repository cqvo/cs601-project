<script lang="ts">
	import { FileText, Eye, Settings, ExternalLink, PlusCircle } from '@lucide/svelte';
	import { goto } from '$app/navigation';
</script>

<div class="space-y-8">
	<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
		<h1 class="text-3xl font-bold">Dashboard</h1>

		<div class="flex gap-2">
			<a
				href="/"
				class="bg-surface-200-700-token hover:bg-surface-300-600-token flex items-center gap-2 rounded-lg px-4 py-2"
			>
				<Eye size={18} />
				<span>View Resume</span>
			</a>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Resume card -->
		<div class="bg-surface-50-900-token rounded-lg p-6 shadow-sm">
			<div class="mb-4 flex items-start justify-between">
				<div class="bg-primary-500/10 text-primary-500 rounded-lg p-3">
					<FileText size={24} />
				</div>
			</div>

			<h2 class="mb-2 text-xl font-semibold">Resume Content</h2>
			<p class="text-surface-600-300-token mb-4">
				Manage your resume sections, entries, and skills.
			</p>

			<button
				onclick={() => goto('/dashboard/resume')}
				class="bg-primary-500 hover:bg-primary-600 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-white"
			>
				<PlusCircle size={18} />
				<span>Manage Content</span>
			</button>
		</div>

		<!-- Settings card -->
		<div class="bg-surface-50-900-token rounded-lg p-6 shadow-sm">
			<div class="mb-4 flex items-start justify-between">
				<div class="bg-primary-500/10 text-primary-500 rounded-lg p-3">
					<Settings size={24} />
				</div>
			</div>

			<h2 class="mb-2 text-xl font-semibold">Account Settings</h2>
			<p class="text-surface-600-300-token mb-4">Update your profile and account preferences.</p>

			<button
				onclick={() => goto('/dashboard/settings')}
				class="bg-primary-500 hover:bg-primary-600 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-white"
			>
				<Settings size={18} />
				<span>Edit Settings</span>
			</button>
		</div>

		<!-- View resume card -->
		<div class="bg-surface-50-900-token rounded-lg p-6 shadow-sm">
			<div class="mb-4 flex items-start justify-between">
				<div class="bg-primary-500/10 text-primary-500 rounded-lg p-3">
					<Eye size={24} />
				</div>
			</div>

			<h2 class="mb-2 text-xl font-semibold">Public Resume</h2>
			<p class="text-surface-600-300-token mb-4">View your public-facing resume page.</p>

			<a
				href="/"
				class="bg-surface-200-700-token hover:bg-surface-300-600-token text-surface-900-50-token flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2"
			>
				<ExternalLink size={18} />
				<span>View Resume</span>
			</a>
		</div>
	</div>
</div>
