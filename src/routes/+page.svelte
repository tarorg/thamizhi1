<script lang="ts">
	import { onMount } from 'svelte';

	let title = '';
	let description = '';
	let submissionStatus = 'idle';
	let apiKey = '';
	let movies = [];
	let drawerOpen = false;

	onMount(async () => {
		await fetchMovies();
	});

	async function fetchMovies() {
		try {
			const response = await fetch('/api/movies');
			if (response.ok) {
				const data = await response.json();
				movies = data.movies;
			} else {
				console.error('Error fetching movies:', await response.text());
			}
		} catch (error) {
			console.error('Error fetching movies:', error);
		}
	}

	async function handleSubmit() {
		submissionStatus = 'submitting';
		try {
			const response = await fetch('/api/movies', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					title,
					description,
					apiKey
				})
			});

			if (response.ok) {
				submissionStatus = 'success';
				console.log('Data submitted successfully.');
				await fetchMovies();
				drawerOpen = false;
				title = '';
				description = '';
				apiKey = '';
			} else {
				submissionStatus = 'error';
				console.error('Error submitting data:', await response.text());
			}
		} catch (error) {
			submissionStatus = 'error';
			console.error('Error submitting data:', error);
		}
	}

	function toggleDrawer() {
		drawerOpen = !drawerOpen;
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="container mx-auto p-4">
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#each movies as movie}
					<tr>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movie.id}</td>
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{movie.title}</td>
						<td class="px-6 py-4 text-sm text-gray-500">{movie.description}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<button class="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={toggleDrawer}>
		Add Movie
	</button>

	<div class="fixed inset-0 overflow-hidden z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true" class:hidden={!drawerOpen}>
		<div class="absolute inset-0 overflow-hidden">
			<div class="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" on:click={toggleDrawer} />
			<div class="fixed inset-y-0 right-0 max-w-full flex">
				<div class="relative w-screen max-w-md">
					<div class="h-full flex flex-col bg-white shadow-xl">
						<div class="px-4 py-6 sm:px-6">
							<div class="flex items-start justify-between">
								<h2 class="text-lg font-medium text-gray-900" id="slide-over-title">
									Add Movie
								</h2>
								<div class="ml-3 h-7 flex items-center">
									<button type="button" class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" on:click={toggleDrawer}>
										<span class="sr-only">Close panel</span>
										<svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</div>
						</div>
						<div class="relative flex-1 px-4 sm:px-6">
							<form on:submit|preventDefault={handleSubmit} class="space-y-4">
								<div>
									<label for="title" class="block text-gray-700 text-sm font-bold mb-2">Title</label>
									<input type="text" id="title" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" bind:value={title} required>
								</div>
								<div>
									<label for="description" class="block text-gray-700 text-sm font-bold mb-2">Description</label>
									<textarea id="description" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" bind:value={description} required></textarea>
								</div>
								<div>
									<label for="apiKey" class="block text-gray-700 text-sm font-bold mb-2">API Key</label>
									<input type="text" id="apiKey" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" bind:value={apiKey} required>
								</div>
								<button type="submit" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" disabled={submissionStatus === 'submitting'}>
									{#if submissionStatus === 'idle'}
										Submit
									{:else if submissionStatus === 'submitting'}
										Submitting...
									{:else if submissionStatus === 'success'}
										Success!
									{:else}
										Error
									{/if}
								</button>
								{#if submissionStatus === 'success'}
									<p class="mt-4 text-green-500">Data submitted successfully!</p>
								{:else if submissionStatus === 'error'}
									<p class="mt-4 text-red-500">There was an error submitting the data.</p>
								{/if}
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
