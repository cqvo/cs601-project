<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import {
		getSections,
		getEntries,
		createEntry,
		updateEntry,
		deleteEntry,
		type Section,
		type Entry
	} from '$lib/appwrite/services';
	import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Calendar, Loader2 } from '@lucide/svelte';

	let section = $state<Section | null>(null);
	let entries = $state<Entry[]>([]);
	let loading = $state(true);
	let error = $state('');

	// New entry form
	let showNewEntryForm = $state(false);
	let newEntry = $state<Partial<Entry>>({
		title: '',
		subtitle: '',
		description: '',
		startDate: '',
		endDate: '',
		isVisible: true
	});

	// Edit entry form
	let editingEntryId = $state<string | null>(null);
	let editingEntry = $state<Partial<Entry>>({});

	const sectionId = $page.params.sectionId;

	onMount(async () => {
		await loadSectionData();
	});

	async function loadSectionData() {
		try {
			loading = true;

			// Load section
			const sections = await getSections();
			section = sections.find((s) => s.$id === sectionId) || null;

			if (!section) {
				error = 'Section not found';
				return;
			}

			// Load entries for this section
			entries = await getEntries(sectionId);
		} catch (err: any) {
			error = err.message || 'Failed to load section data';
		} finally {
			loading = false;
		}
	}

	function startNewEntry() {
		showNewEntryForm = true;
		newEntry = {
			title: '',
			subtitle: '',
			description: '',
			startDate: '',
			endDate: '',
			isVisible: true
		};
	}

	async function submitNewEntry() {
		if (!sectionId || !newEntry.title?.trim()) return;

		try {
			loading = true;

			const entryToCreate = {
				...newEntry,
				sectionId,
				order: entries.length,
				title: newEntry.title!.trim(),
				subtitle: newEntry.subtitle?.trim() || '',
				description: newEntry.description?.trim() || '',
				isVisible: true,
				current: !newEntry.endDate,
			} as Entry;

			await createEntry(entryToCreate);
			await loadSectionData();

			// Reset form
			showNewEntryForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create entry';
		} finally {
			loading = false;
		}
	}

	function startEditEntry(entry: Entry) {
		editingEntryId = entry.$id;
		editingEntry = { ...entry };
	}

	async function submitEditEntry() {
		if (!editingEntryId || !editingEntry.title?.trim()) return;

		try {
			loading = true;

			const cleanedEntry = {
				title: editingEntry.title.trim(),
				subtitle: editingEntry.subtitle?.trim() || '',
				description: editingEntry.description?.trim() || '',
				startDate: editingEntry.startDate || '',
				endDate: editingEntry.endDate || '',
				isVisible: editingEntry.isVisible
			};

			await updateEntry(editingEntryId, cleanedEntry);
			await loadSectionData();

			// Reset form
			editingEntryId = null;
		} catch (err: any) {
			error = err.message || 'Failed to update entry';
		} finally {
			loading = false;
		}
	}

	async function toggleEntryVisibility(entry: Entry) {
		try {
			loading = true;
			await updateEntry(entry.$id!, {
				isVisible: !entry.isVisible
			});
			await loadSectionData();
		} catch (err: any) {
			error = err.message || 'Failed to update entry visibility';
		} finally {
			loading = false;
		}
	}

	async function removeEntry(entryId: string) {
		if (!confirm('Are you sure you want to delete this entry?')) {
			return;
		}

		try {
			loading = true;
			await deleteEntry(entryId);
			await loadSectionData();
		} catch (err: any) {
			error = err.message || 'Failed to delete entry';
		} finally {
			loading = false;
		}
	}

	$inspect(section, entries, loading, error);
</script>

<div class="space-y-6">
	<!-- Header with back button and section title -->
	<div class="mb-6 flex items-center gap-4">
		<a href="/dashboard/resume" class="hover:bg-surface-200-700-token rounded-lg p-2">
			<ArrowLeft size={20} />
		</a>

		{#if section}
			<h1 class="text-3xl font-bold">{section.title} Entries</h1>
		{:else if loading}
			<div class="bg-surface-200-700-token h-9 w-40 animate-pulse rounded"></div>
		{:else}
			<h1 class="text-3xl font-bold">Section Not Found</h1>
		{/if}

		{#if section}
			<button
				onclick={startNewEntry}
				class="bg-primary-500 hover:bg-primary-600 ml-auto flex items-center gap-2 rounded-lg px-4 py-2 text-white"
				disabled={loading || showNewEntryForm}
			>
				<Plus size={18} />
				<span>Add Entry</span>
			</button>
		{/if}
	</div>

	{#if error}
		<div class="bg-error-500/20 text-error-500 rounded-lg p-4">
			{error}
		</div>
	{/if}

	<!-- Loading state -->
	{#if loading && !entries.length && !section}
		<div class="my-12 flex justify-center">
			<Loader2 size={24} class="animate-spin" />
		</div>
	{/if}

	<!-- New entry form -->
	{#if showNewEntryForm}
		<div class="bg-surface-50-900-token border-primary-500 rounded-lg border p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">Add New Entry</h2>

			<form onsubmit={(e) => { e.preventDefault(); submitNewEntry(); }} class="space-y-4">
				<div>
					<label for="entryTitle" class="mb-1 block text-sm font-medium">Title *</label>
					<input
						id="entryTitle"
						type="text"
						bind:value={newEntry.title}
						class="bg-surface-50-900-token w-full rounded-lg border p-3"
						placeholder="e.g., Software Engineer, Bachelor of Science"
						required
					/>
				</div>

				<div>
					<label for="entrySubtitle" class="mb-1 block text-sm font-medium">Subtitle</label>
					<input
						id="entrySubtitle"
						type="text"
						bind:value={newEntry.subtitle}
						class="bg-surface-50-900-token w-full rounded-lg border p-3"
						placeholder="e.g., Company Name, University Name"
					/>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label for="entryStartDate" class="mb-1 block text-sm font-medium">Start Date</label>
						<div class="relative">
							<span class="text-surface-600-300-token absolute top-3 left-3">
								<Calendar size={18} />
							</span>
							<input
								id="entryStartDate"
								type="date"
								bind:value={newEntry.startDate}
								class="bg-surface-50-900-token w-full rounded-lg border p-3 pl-10"
							/>
						</div>
					</div>

					<div>
						<label for="entryEndDate" class="mb-1 block text-sm font-medium">End Date</label>
						<div class="relative">
							<span class="text-surface-600-300-token absolute top-3 left-3">
								<Calendar size={18} />
							</span>
							<input
								id="entryEndDate"
								type="date"
								bind:value={newEntry.endDate}
								class="bg-surface-50-900-token w-full rounded-lg border p-3 pl-10"
							/>
							<div class="text-surface-600-300-token mt-1 text-xs">Leave empty for "Present"</div>
						</div>
					</div>
				</div>

				<div>
					<label for="entryDescription" class="mb-1 block text-sm font-medium">Description</label>
					<textarea
						id="entryDescription"
						bind:value={newEntry.description}
						class="bg-surface-50-900-token min-h-[100px] w-full rounded-lg border p-3"
						placeholder="Enter a description of this entry"
					></textarea>
				</div>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => (showNewEntryForm = false)}
						class="hover:bg-surface-200-700-token rounded-lg border px-4 py-2"
					>
						Cancel
					</button>

					<button
						type="submit"
						class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white"
						disabled={loading || !newEntry.title?.trim()}
					>
						{#if loading}
							<Loader2 size={18} class="animate-spin" />
						{:else}
							<Plus size={18} />
						{/if}
						<span>Add Entry</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Entries list -->
	{#if !loading && section && !entries.length}
		<div class="bg-surface-50-900-token rounded-lg p-8 text-center shadow-sm">
			<p class="text-surface-600-300-token mb-4">
				You haven't created any entries for this section yet.
			</p>

			{#if !showNewEntryForm}
				<button
					onclick={startNewEntry}
					class="bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white"
				>
					<Plus size={18} />
					<span>Add Your First Entry</span>
				</button>
			{/if}
		</div>
	{:else if section}
		<div class="space-y-6">
			{#each entries as entry (entry.$id)}
				<div
					class="bg-surface-50-900-token rounded-lg border-l-4 p-6 shadow-sm {entry.isVisible
						? 'border-primary-500'
						: 'border-surface-300-600-token'}"
				>
					{#if editingEntryId === entry.$id}
						<form onsubmit={(e) => { e.preventDefault(); submitEditEntry(); }} class="space-y-4">
							<div>
								<label class="mb-1 block text-sm font-medium">Title *</label>
								<input
									type="text"
									bind:value={editingEntry.title}
									class="bg-surface-50-900-token w-full rounded-lg border p-3"
									placeholder="e.g., Software Engineer, Bachelor of Science"
									required
								/>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium">Subtitle</label>
								<input
									type="text"
									bind:value={editingEntry.subtitle}
									class="bg-surface-50-900-token w-full rounded-lg border p-3"
									placeholder="e.g., Company Name, University Name"
								/>
							</div>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div>
									<label class="mb-1 block text-sm font-medium">Start Date</label>
									<div class="relative">
										<span class="text-surface-600-300-token absolute top-3 left-3">
											<Calendar size={18} />
										</span>
										<input
											type="date"
											bind:value={editingEntry.startDate}
											class="bg-surface-50-900-token w-full rounded-lg border p-3 pl-10"
										/>
									</div>
								</div>

								<div>
									<label class="mb-1 block text-sm font-medium">End Date</label>
									<div class="relative">
										<span class="text-surface-600-300-token absolute top-3 left-3">
											<Calendar size={18} />
										</span>
										<input
											type="date"
											bind:value={editingEntry.endDate}
											class="bg-surface-50-900-token w-full rounded-lg border p-3 pl-10"
										/>
										<div class="text-surface-600-300-token mt-1 text-xs">
											Leave empty for "Present"
										</div>
									</div>
								</div>
							</div>

							<div>
								<label class="mb-1 block text-sm font-medium">Description</label>
								<textarea
									bind:value={editingEntry.description}
									class="bg-surface-50-900-token min-h-[100px] w-full rounded-lg border p-3"
									placeholder="Enter a description of this entry"
								></textarea>
							</div>

							<div class="flex justify-end gap-2">
								<button
									type="button"
									onclick={() => (editingEntryId = null)}
									class="hover:bg-surface-200-700-token rounded-lg border px-4 py-2"
								>
									Cancel
								</button>

								<button
									type="submit"
									class="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-white"
									disabled={loading || !editingEntry.title?.trim()}
								>
									Save
								</button>
							</div>
						</form>
					{:else}
						<div>
							<div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
								<div>
									<h3 class="flex items-center gap-2 text-xl font-semibold">
										{entry.title}
										{#if !entry.isVisible}
											<span
												class="bg-surface-300-600-token text-surface-900-50-token rounded-full px-2 py-0.5 text-xs"
											>
												Hidden
											</span>
										{/if}
									</h3>

									{#if entry.subtitle}
										<div class="text-lg">{entry.subtitle}</div>
									{/if}

									<div class="text-surface-600-300-token mt-1 text-sm">
										{#if entry.startDate || entry.endDate}
											<div class="flex items-center gap-1">
												<Calendar size={14} />
												<span>
													{entry.startDate
														? new Date(entry.startDate).toLocaleDateString('en-US', {
																year: 'numeric',
																month: 'short'
															})
														: ''}
													{entry.startDate && entry.endDate ? ' - ' : ''}
													{entry.endDate
														? new Date(entry.endDate).toLocaleDateString('en-US', {
																year: 'numeric',
																month: 'short'
															})
														: 'Present'}
												</span>
											</div>
										{/if}
									</div>
								</div>

								<div class="flex flex-wrap gap-2">
									<button
										onclick={() => toggleEntryVisibility(entry)}
										class="hover:bg-surface-200-700-token rounded-lg p-2"
										title={entry.isVisible ? 'Hide entry' : 'Show entry'}
									>
										{#if entry.isVisible}
											<Eye size={18} />
										{:else}
											<EyeOff size={18} />
										{/if}
									</button>

									<button
										onclick={() => startEditEntry(entry)}
										class="hover:bg-surface-200-700-token rounded-lg p-2"
										title="Edit entry"
									>
										<Edit size={18} />
									</button>

									<button
										onclick={() => removeEntry(entry.$id!)}
										class="hover:bg-surface-200-700-token text-error-500 rounded-lg p-2"
										title="Delete entry"
									>
										<Trash2 size={18} />
									</button>
								</div>
							</div>

							{#if entry.description}
								<div class="prose prose-sm mt-4 max-w-none">
									{entry.description}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
