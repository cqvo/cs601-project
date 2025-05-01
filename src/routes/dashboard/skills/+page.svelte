<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getSkills,
		createSkill,
		updateSkill,
		deleteSkill,
		type Skill
	} from '$lib/appwrite/services';
	import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from '@lucide/svelte';

	let skills = $state<Skill[]>([]);
	let categories = $state<string[]>([]);
	let loading = $state(true);
	let error = $state('');

	// New skill form
	let showNewSkillForm = $state(false);
	let newSkill = $state<Partial<Skill>>({
		name: '',
		level: 3,
		category: '',
		isVisible: true
	});

	// Edit skill form
	let editingSkillId = $state<string | null>(null);
	let editingSkill = $state<Partial<Skill>>({});

	onMount(async () => {
		await loadSkills();
	});

	async function loadSkills() {
		try {
			loading = true;
			skills = await getSkills();

			// Extract unique categories
			const uniqueCategories = new Set(skills.map((skill) => skill.category));
			categories = Array.from(uniqueCategories).sort();
		} catch (err: any) {
			error = err.message || 'Failed to load skills';
		} finally {
			loading = false;
		}
	}

	function startNewSkill() {
		showNewSkillForm = true;
		newSkill = {
			name: '',
			level: 3,
			category: categories.length > 0 ? categories[0] : '',
			isVisible: true
		};
	}

	async function submitNewSkill() {
		if (!newSkill.name?.trim() || !newSkill.category?.trim()) return;

		try {
			loading = true;

			const skillToCreate = {
				...newSkill,
				name: newSkill.name.trim(),
				category: newSkill.category.trim(),
				level: newSkill.level || 3,
				order: skills.filter((s) => s.category === newSkill.category).length,
				isVisible: true
			} as Skill;

			await createSkill(skillToCreate);
			await loadSkills();

			// Reset form
			showNewSkillForm = false;
		} catch (err: any) {
			error = err.message || 'Failed to create skill';
		} finally {
			loading = false;
		}
	}

	function startEditSkill(skill: Skill) {
		editingSkillId = skill.$id;
		editingSkill = { ...skill };
	}

	async function submitEditSkill() {
		if (!editingSkillId || !editingSkill.name?.trim() || !editingSkill.category?.trim()) return;

		try {
			loading = true;

			const updatedSkill = {
				name: editingSkill.name.trim(),
				category: editingSkill.category.trim(),
				level: editingSkill.level || 3,
				isVisible: editingSkill.isVisible
			};

			await updateSkill(editingSkillId, updatedSkill);
			await loadSkills();

			// Reset form
			editingSkillId = null;
		} catch (err: any) {
			error = err.message || 'Failed to update skill';
		} finally {
			loading = false;
		}
	}

	async function toggleSkillVisibility(skill: Skill) {
		try {
			loading = true;
			await updateSkill(skill.$id!, {
				isVisible: !skill.isVisible
			});
			await loadSkills();
		} catch (err: any) {
			error = err.message || 'Failed to update skill visibility';
		} finally {
			loading = false;
		}
	}

	async function removeSkill(skillId: string) {
		if (!confirm('Are you sure you want to delete this skill?')) {
			return;
		}

		try {
			loading = true;
			await deleteSkill(skillId);
			await loadSkills();
		} catch (err: any) {
			error = err.message || 'Failed to delete skill';
		} finally {
			loading = false;
		}
	}

	function addCategory() {
		const category = prompt('Enter a new category name:');
		if (category?.trim()) {
			if (!categories.includes(category.trim())) {
				categories = [...categories, category.trim()].sort();
			}
			newSkill.category = category.trim();
		}
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Skills</h1>

		<button
			onclick={startNewSkill}
			class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white"
			disabled={loading || showNewSkillForm}
		>
			<Plus size={18} />
			<span>Add Skill</span>
		</button>
	</div>

	{#if error}
		<div class="bg-error-500/20 text-error-500 rounded-lg p-4">
			{error}
		</div>
	{/if}

	<!-- New skill form -->
	{#if showNewSkillForm}
		<div class="bg-surface-50-900-token border-primary-500 rounded-lg border p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">Add New Skill</h2>

			<form onsubmit={(e) => { e.preventDefault(); submitNewSkill(); }} class="space-y-4">
				<div>
					<label for="skillName" class="mb-1 block text-sm font-medium">Skill Name *</label>
					<input
						id="skillName"
						type="text"
						bind:value={newSkill.name}
						class="bg-surface-50-900-token w-full rounded-lg border p-3"
						placeholder="e.g., JavaScript, Project Management"
						required
					/>
				</div>

				<div>
					<label for="skillCategory" class="mb-1 block text-sm font-medium">Category *</label>
					<div class="flex gap-2">
						<select
							id="skillCategory"
							bind:value={newSkill.category}
							class="bg-surface-50-900-token w-full rounded-lg border p-3"
							required
						>
							{#if categories.length === 0}
								<option value="">Add a category...</option>
							{:else}
								{#each categories as category}
									<option value={category}>{category}</option>
								{/each}
							{/if}
						</select>

						<button
							type="button"
							onclick={addCategory}
							class="bg-surface-200-700-token hover:bg-surface-300-600-token rounded-lg px-4 py-2"
						>
							<Plus size={18} />
						</button>
					</div>
				</div>

				<div>
					<label for="skillLevel" class="mb-1 block text-sm font-medium">
						Skill Level: {newSkill.level}/5
					</label>
					<input
						id="skillLevel"
						type="range"
						min="1"
						max="5"
						step="1"
						bind:value={newSkill.level}
						class="w-full"
					/>
					<div class="text-surface-600-300-token flex justify-between text-xs">
						<span>Beginner</span>
						<span>Intermediate</span>
						<span>Expert</span>
					</div>
				</div>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => (showNewSkillForm = false)}
						class="hover:bg-surface-200-700-token rounded-lg border px-4 py-2"
					>
						Cancel
					</button>

					<button
						type="submit"
						class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white"
						disabled={loading || !newSkill.name?.trim() || !newSkill.category?.trim()}
					>
						{#if loading}
							<Loader2 size={18} class="animate-spin" />
						{:else}
							<Plus size={18} />
						{/if}
						<span>Add Skill</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Skills list -->
	{#if loading && !skills.length}
		<div class="my-12 flex justify-center">
			<Loader2 size={24} class="animate-spin" />
		</div>
	{:else if !skills.length}
		<div class="bg-surface-50-900-token rounded-lg p-8 text-center shadow-sm">
			<p class="text-surface-600-300-token mb-4">You haven't added any skills yet.</p>

			{#if !showNewSkillForm}
				<button
					onclick={startNewSkill}
					class="bg-primary-500 hover:bg-primary-600 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white"
				>
					<Plus size={18} />
					<span>Add Your First Skill</span>
				</button>
			{/if}
		</div>
	{:else}
		<!-- Group skills by category -->
		{#each categories as category}
			{@const categorySkills = skills.filter((skill) => skill.category === category)}
			{#if categorySkills.length > 0}
				<div class="bg-surface-50-900-token rounded-lg p-6 shadow-sm">
					<h2 class="mb-4 text-xl font-semibold">{category}</h2>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						{#each categorySkills as skill (skill.$id)}
							<div
								class="border-surface-300-600-token rounded-lg border p-4 {!skill.isVisible
									? 'opacity-60'
									: ''}"
							>
								{#if editingSkillId === skill.$id}
									<form onsubmit={(e) => { e.preventDefault(); submitEditSkill(); }} class="space-y-4">
										<div>
											<label class="mb-1 block text-sm font-medium">Skill Name *</label>
											<input
												type="text"
												bind:value={editingSkill.name}
												class="bg-surface-50-900-token w-full rounded-lg border p-3"
												required
											/>
										</div>

										<div>
											<label class="mb-1 block text-sm font-medium">Category *</label>
											<div class="flex gap-2">
												<select
													bind:value={editingSkill.category}
													class="bg-surface-50-900-token w-full rounded-lg border p-3"
													required
												>
													{#each categories as cat}
														<option value={cat}>{cat}</option>
													{/each}
												</select>

												<button
													type="button"
													onclick={addCategory}
													class="bg-surface-200-700-token hover:bg-surface-300-600-token rounded-lg px-4 py-2"
												>
													<Plus size={18} />
												</button>
											</div>
										</div>

										<div>
											<label class="mb-1 block text-sm font-medium">
												Skill Level: {editingSkill.level}/5
											</label>
											<input
												type="range"
												min="1"
												max="5"
												step="1"
												bind:value={editingSkill.level}
												class="w-full"
											/>
										</div>

										<div class="flex justify-end gap-2">
											<button
												type="button"
												onclick={() => (editingSkillId = null)}
												class="hover:bg-surface-200-700-token rounded-lg border px-4 py-2"
											>
												Cancel
											</button>

											<button
												type="submit"
												class="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-white"
												disabled={loading ||
													!editingSkill.name?.trim() ||
													!editingSkill.category?.trim()}
											>
												Save
											</button>
										</div>
									</form>
								{:else}
									<div class="flex items-center justify-between">
										<div>
											<div class="flex items-center gap-2 font-medium">
												{skill.name}
												{#if !skill.isVisible}
													<span
														class="bg-surface-300-600-token text-surface-900-50-token rounded-full px-2 py-0.5 text-xs"
													>
														Hidden
													</span>
												{/if}
											</div>

											<div class="mt-2 flex">
												{#each Array(5) as _, i}
													<div
														class={`mx-0.5 h-2 w-6 rounded-full ${i < skill.level ? 'bg-primary-500' : 'bg-surface-300-600-token'}`}
													></div>
												{/each}
											</div>
										</div>

										<div class="flex gap-1">
											<button
												onclick={() => toggleSkillVisibility(skill)}
												class="hover:bg-surface-200-700-token rounded-lg p-2"
												title={skill.isVisible ? 'Hide skill' : 'Show skill'}
											>
												{#if skill.isVisible}
													<Eye size={16} />
												{:else}
													<EyeOff size={16} />
												{/if}
											</button>

											<button
												onclick={() => startEditSkill(skill)}
												class="hover:bg-surface-200-700-token rounded-lg p-2"
												title="Edit skill"
											>
												<Edit size={16} />
											</button>

											<button
												onclick={() => removeSkill(skill.$id!)}
												class="hover:bg-surface-200-700-token text-error-500 rounded-lg p-2"
												title="Delete skill"
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	{/if}
</div>
