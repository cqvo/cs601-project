<script lang="ts">
	import { getVisibleSections, getVisibleEntries, getVisibleSkills } from '$lib/appwrite/services';
	import { onMount } from 'svelte';
	import { Printer, Briefcase, GraduationCap, Award } from '@lucide/svelte';

	let sections = $state([]);
	let entries = $state([]);
	let skills = $state([]);
	let loading = $state(true);

	// Function to load resume data
	async function loadResumeData() {
		try {
			loading = true;
			const [sectionsData, entriesData, skillsData] = await Promise.all([
				getVisibleSections(),
				getVisibleEntries(),
				getVisibleSkills()
			]);

			sections = sectionsData;
			entries = entriesData;
			skills = skillsData;
		} catch (error) {
			console.error('Error loading resume data:', error);
		} finally {
			loading = false;
		}
	}

	// Function to get entries for a specific section
	function getSectionEntries(sectionId: string) {
		return entries.filter((entry) => entry.sectionId === sectionId);
	}

	// Print resume function
	function printResume() {
		window.print();
	}

	// Icon mapping for sections
	function getSectionIcon(title: string) {
		const iconMap: Record<string, any> = {
			Experience: Briefcase,
			Education: GraduationCap,
			Awards: Award
		};

		return iconMap[title] || Briefcase;
	}

	onMount(() => {
		loadResumeData();
	});
</script>

<div class="relative">
	<!-- Resume header with print button -->
	<div class="mb-8 flex items-start justify-between print:hidden">
		<h1 class="text-4xl font-bold">My Resume</h1>
		<button
			onclick={printResume}
			class="bg-primary-500 hover:bg-primary-600 flex items-center gap-2 rounded-lg px-4 py-2 text-white"
		>
			<Printer size={18} />
			<span>Print</span>
		</button>
	</div>

	<!-- Loading state -->
	{#if loading}
		<div class="my-12 flex justify-center">
			<div class="border-primary-500 h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
		</div>
	{:else}
		<!-- Resume content -->
		<div class="mx-auto max-w-4xl space-y-12">
			{#each sections as section (section.id)}
				<section>
					<div class="mb-4 flex items-center gap-2">
						<span class="text-primary-500">
							<svelte:component this={getSectionIcon(section.title)} size={24} />
						</span>
						<h2 class="border-primary-500 border-b-2 pb-1 text-2xl font-bold">{section.title}</h2>
					</div>

					<div class="space-y-6">
						{#each getSectionEntries(section.id) as entry (entry.id)}
							<div class="bg-surface-50-900-token rounded-lg p-4 shadow-sm">
								<div class="mb-2 flex flex-col md:flex-row md:justify-between">
									<h3 class="text-xl font-semibold">{entry.title}</h3>
									{#if entry.subtitle}
										<div class="text-lg">{entry.subtitle}</div>
									{/if}
								</div>

								{#if entry.startDate || entry.endDate}
									<div class="mb-2 text-sm">
										{entry.startDate
											? new Date(entry.startDate).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'short'
												})
											: ''}
										{entry.startDate && entry.endDate ? ' - ' : ''}
										{entry.endDate
											? entry.endDate === 'Present'
												? 'Present'
												: new Date(entry.endDate).toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'short'
													})
											: ''}
									</div>
								{/if}

								{#if entry.description}
									<div class="prose prose-sm max-w-none">
										{entry.description}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</section>
			{/each}

			<!-- Skills section if we have any skills -->
			{#if skills.length > 0}
				<section>
					<h2 class="border-primary-500 mb-4 border-b-2 pb-1 text-2xl font-bold">Skills</h2>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each skills as skill (skill.id)}
							<div class="bg-surface-50-900-token rounded-lg p-4 shadow-sm">
								<div class="flex items-center justify-between">
									<span class="font-semibold">{skill.name}</span>
									<div class="flex">
										{#each Array(5) as _, i}
											<div
												class={`mx-0.5 h-2 w-2 rounded-full ${i < skill.level ? 'bg-primary-500' : 'bg-surface-300-600-token'}`}
											></div>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Print styles */
	@media print {
		:global(body) {
			background: white;
			color: black;
		}

		:global(header),
		:global(footer) {
			display: none;
		}

		:global(main) {
			padding: 0;
			margin: 0;
		}

		h1,
		h2,
		h3,
		h4 {
			color: black;
		}

		.shadow-sm {
			box-shadow: none;
		}

		section {
			break-inside: avoid;
			page-break-inside: avoid;
			margin-bottom: 1.5rem;
		}
	}
</style>
