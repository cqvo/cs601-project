<script lang="ts">
	import { onMount } from 'svelte';
	import { getSections, createSection, updateSection, deleteSection } from '$lib/appwrite/services';
	import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from '@lucide/svelte';

	let sections = $state([]);
	let loading = $state(true);
	let error = $state('');

	// New section form
	let showNewSectionForm = $state(false);
	let newSectionTitle = $state('');

	// Edit section form
	let editingSectionId = $state<string | null>(null);
	let editingSectionTitle = $state('');

	onMount(async () => {
		await loadSections();
	});

	async function loadSections() {
		try {
			loading = true;
			sections = await getSections();
		} catch (err: any) {
			error = err.message || 'Failed to load sections';
		} finally {
			loading = false;
		}
	}

	function startNewSection() {
		showNewSectionForm = true;
	}

	function createSlug(text) {
		return text
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '');
	}

	async function submitNewSection() {
		if (!newSectionTitle.trim()) return;

		try {
			loading = true;
			// Create a new section with order set to the next available position
			const newSection = {
				title: newSectionTitle.trim(),
				slug: createSlug(newSectionTitle),
				order: sections.length,
				isVisible: true
			};

			await createSection(newSection);
			await loadSections();

			// Reset form
			newSectionTitle = '';
			showNewSectionForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create section';
		} finally {
			loading = false;
		}
	}

	function startEditSection(section) {
		editingSectionId = section.id;
		editingSectionTitle = section.title;
	}

	async function submitEditSection() {
		if (!editingSectionId || !editingSectionTitle.trim()) return;

		try {
			loading = true;
			await updateSection(editingSectionId, {
				title: editingSectionTitle.trim()
			});
			await loadSections();

			// Reset form
			editingSectionId = null;
			editingSectionTitle = '';
		} catch (err: any) {
			error = err.message || 'Failed to update section';
		} finally {
			loading = false;
		}
	}

	async function toggleSectionVisibility(section) {
		try {
			loading = true;
			await updateSection(section.id, {
				isVisible: !section.isVisible
			});
			await loadSections();
		} catch (err: any) {
			error = err.message || 'Failed to update section visibility';
		} finally {
			loading = false;
		}
	}

	async function removeSection(sectionId: string) {
		if (
			!confirm(
				'Are you sure you want to delete this section? This will also remove all entries associated with it.'
			)
		) {
			return;
		}

		try {
			loading = true;
			await deleteSection(sectionId);
			await loadSections();
		} catch (err: any) {
			error = err.message || 'Failed to delete section';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Resume Sections</h1>

		<button
			onclick={startNewSection}
			class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white"
			disabled={loading || showNewSectionForm}
		>
			<Plus size={18} />
			<span>Add Section</span>
		</button>
	</div>

	{#if error}
		<div class="bg-error-500/20 text-error-500 rounded-lg p-4">
			{error}
		</div>
	{/if}

	<!-- New section form -->
	{#if showNewSectionForm}
		<div class="bg-surface-50-900-token border-primary-500 rounded-lg border p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">Add New Section</h2>

			<form onsubmit={(e) => { e.preventDefault(); submitNewSection(); }} class="space-y-4">
				<div>
					<label for="sectionTitle" class="mb-1 block text-sm font-medium">Section Title</label>
					<input
						id="sectionTitle"
						type="text"
						bind:value={newSectionTitle}
						class="bg-surface-50-900-token w-full rounded-lg border p-3"
						placeholder="e.g., Experience, Education, Skills"
						required
					/>
				</div>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => (showNewSectionForm = false)}
						class="hover:bg-surface-200-700-token rounded-lg border px-4 py-2"
					>
						Cancel
					</button>

					<button
						type="submit"
						class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white"
						disabled={loading || !newSectionTitle.trim()}
					>
						{#if loading}
							<Loader2 size={18} class="animate-spin" />
						{:else}
							<Plus size={18} />
						{/if}
						<span>Add Section</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Sections list -->
	{#if loading && !sections.length}
		<div class="my-12 flex justify-center">
			<Loader2 size={24} class="animate-spin" />
		</div>
	{:else if !sections.length}
		<div class="bg-surface-50-900-token rounded-lg p-8 text-center shadow-sm">
			<p class="text-surface-600-300-token mb-4">You haven't created any resume sections yet.</p>

			{#if !showNewSectionForm}
				<button
					onclick={startNewSection}
					class="bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white"
				>
					<Plus size={18} />
					<span>Add Your First Section</span>
				</button>
			{/if}
		</div>
	{:else}
		<div class="space-y-4">
			{#each sections as section (section.$id)}
				<div
					class="bg-surface-50-900-token rounded-lg border-l-4 p-6 shadow-sm {section.isVisible
						? 'border-primary-500'
						: 'border-surface-300-600-token'}"
				>
					{#if editingSectionId === section.$id}
						<form
							onsubmit={(e) => { e.preventDefault(); submitEditSection(); }}
							class="flex flex-col gap-4 md:flex-row"
						>
							<div class="flex-grow">
								<input
									type="text"
									bind:value={editingSectionTitle}
									class="bg-surface-50-900-token w-full rounded-lg border p-3"
									placeholder="Section title"
									required
								/>
							</div>

							<div class="flex gap-2">
								<button
									type="button"
									onclick={() => (editingSectionId = null)}
									class="hover:bg-surface-200-700-token rounded-lg border px-4 py-2"
								>
									Cancel
								</button>

								<button
									type="submit"
									class="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-white"
									disabled={loading || !editingSectionTitle.trim()}
								>
									Save
								</button>
							</div>
						</form>
					{:else}
						<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
							<div>
								<h3 class="flex items-center gap-2 text-xl font-semibold">
									{section.title}
									{#if !section.isVisible}
										<span
											class="bg-surface-300-600-token text-surface-900-50-token rounded-full px-2 py-0.5 text-xs"
										>
											Hidden
										</span>
									{/if}
								</h3>
								<div class="text-surface-600-300-token mt-1 text-sm">
									Last updated: {new Date(section.$updatedAt).toLocaleString()}
								</div>
							</div>

							<div class="flex flex-wrap gap-2">
								<a
									href={`/dashboard/resume/${section.$id}`}
									class="bg-surface-200-700-token hover:bg-surface-300-600-token inline-flex items-center gap-2 rounded-lg px-4 py-2"
								>
									<Plus size={18} />
									<span>Entries</span>
								</a>

								<button
									onclick={() => toggleSectionVisibility(section)}
									class="hover:bg-surface-200-700-token rounded-lg p-2"
									title={section.isVisible ? 'Hide section' : 'Show section'}
								>
									{#if section.isVisible}
										<EyeOff size={18} />
									{:else}
										<Eye size={18} />
									{/if}
								</button>

								<button
									onclick={() => startEditSection(section)}
									class="hover:bg-surface-200-700-token rounded-lg p-2"
									title="Edit section"
								>
									<Edit size={18} />
								</button>

								<button
									onclick={() => removeSection(section.id)}
									class="hover:bg-surface-200-700-token text-error-500 rounded-lg p-2"
									title="Delete section"
								>
									<Trash2 size={18} />
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
