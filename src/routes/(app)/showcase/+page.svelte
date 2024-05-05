<script lang="ts">
	import hljs from 'highlight.js';
	import 'highlight.js/styles/atom-one-dark.min.css';
	import { page } from '$app/stores';

	let route = '';
	let procedure = '';
	let templatePage = '';

	$: if ($page) {
		route = $page.url.searchParams.get('route') ?? '';
		procedure = $page.url.searchParams.get('procedure') ?? '';
		templatePage = $page.url.searchParams.get('templatePage') ?? '';

		getProcedureRouter(route, procedure);
		getProcedureStructure(procedure);
		getTemplatePage(templatePage);
	}

	let linesObject: {
		structure: string[];
		router: string[];
		templatePage: string[];
	} = {
		structure: [],
		router: [],
		templatePage: []
	};

	const extractRouterProcedureLines = (code: string, procedure: string) => {
		const lines = code.split('\n');
		let start = -1;
		let end = -1;
		let insideProcedure = false;
		const result = [];

		let openBraces = 0;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].includes(procedure) && lines[i].includes('=>')) {
				start = i;
				insideProcedure = true;
				openBraces = 0;
			}

			if (insideProcedure) {
				result.push(lines[i]);
			}

			if (insideProcedure && lines[i].includes('{')) {
				const brancesCount = (lines[i].match(/{/g) || []).length;
				openBraces += brancesCount;
			}

			if (insideProcedure && lines[i].includes('}')) {
				const brancesCount = (lines[i].match(/}/g) || []).length;
				openBraces -= brancesCount;
			}

			if (insideProcedure && lines[i].includes('}') && openBraces < 1) {
				end = i;
				insideProcedure = false;
				break;
			}
		}

		if (start !== -1 && end !== -1) {
			// get the spaces before the first line
			const spaces = result[0].split(procedure)[0];
			// remove the spaces from all lines
			for (let i = 0; i <= result.length - 1; i++) {
				result[i] = result[i].replace(spaces, '');
			}
			return result;
		} else {
			return null;
		}
	};

	function extractStructureProcedure(code: string, procedure: string) {
		// Initialize variables to track whether we are inside the desired block
		let inBlock = false;
		let braceCount = 0;
		let newLines: string[] = [];

		// Split the code into lines
		const lines = code.split('\n');

		// Iterate through each line of code
		lines.forEach((line) => {
			// Check if the line contains the procedure name and starts a block
			if (line.trim().startsWith(procedure) && line.includes('{')) {
				inBlock = true;
				braceCount = 1; // Start of a new block
				newLines.push(line);
				return;
			}

			// If we are in the block, we need to keep track of braces to know when the block ends
			if (inBlock) {
				// Count opening and closing braces
				const openBraces = (line.match(/\{/g) || []).length;
				const closeBraces = (line.match(/\}/g) || []).length;
				braceCount += openBraces - closeBraces;

				// Add the current line to the output
				newLines.push(line);

				// If the brace count goes to zero, we have reached the end of the block
				if (braceCount === 0) {
					inBlock = false;
				}
			}
		});

		// get the spaces before the first line
		const spaces = newLines[0].split(procedure)[0];
		// remove the spaces from all lines
		for (let i = 0; i <= newLines.length - 1; i++) {
			newLines[i] = newLines[i].replace(spaces, '');
		}
		return newLines;
	}

	const getProcedureRouter = async (route: string, procedure: string) => {
		const res = (await fetch(
			`https://raw.githubusercontent.com/MahmoodKhalil57/svelteTemplate_V2/main/src/server/routes/${route}.server.ts`
		)) as Response;
		const routerCode = await res.text();
		const procedureLinesString = extractRouterProcedureLines(routerCode, procedure);
		if (procedureLinesString) {
			linesObject.router = procedureLinesString;
		} else {
			linesObject.router = [];
		}
	};

	const getProcedureStructure = async (procedure: string) => {
		const res = (await fetch(
			'https://raw.githubusercontent.com/MahmoodKhalil57/svelteTemplate_V2/main/src/server/helpers/apiStructure.server.ts'
		)) as Response;
		const routerCode = await res.text();
		const procedureLinesString = extractStructureProcedure(routerCode, procedure);
		console.log('🚀 ~ procedureLinesString:', procedureLinesString);
		if (procedureLinesString) {
			linesObject.structure = procedureLinesString;
		} else {
			linesObject.structure = [];
		}
	};

	const getTemplatePage = async (path: string) => {
		const encodedPath = encodeURIComponent(path);
		const res = (await fetch(
			`https://raw.githubusercontent.com/MahmoodKhalil57/svelteTemplate_V2/main/src/routes/${encodedPath}/%2Bpage.svelte
			`
		)) as Response;
		const routerCode = await res.text();
		const procedureLinesString = routerCode.split('\n');
		if (procedureLinesString) {
			linesObject.templatePage = procedureLinesString;
		} else {
			linesObject.templatePage = [];
		}
	};

	const formatElement = (node: HTMLElement) => {
		hljs.highlightElement(node as HTMLElement);
	};
</script>

<section class="w-full flex flex-col justify-center items-center gap-3">
	<button
		on:click={() => {
			window.history.back();
		}}>Back</button
	>
	<div class="w-full flex flex-col justify-center items-center gap-3">
		{#if linesObject.structure.length}
			<div class="mockup-code flex-row max-w-5xl">
				{#each linesObject.structure as line, i}
					<pre data-prefix={i + 1} class="flex flex-row"><code use:formatElement>{line}</code></pre>
				{/each}
			</div>
		{/if}
		{#if linesObject.router.length}
			<div class="mockup-code flex-row max-w-5xl">
				{#each linesObject.router as line, i}
					<pre data-prefix={i + 1} class="flex flex-row"><code use:formatElement>{line}</code></pre>
				{/each}
			</div>
		{/if}
		{#if linesObject.templatePage.length}
			<div class="mockup-code flex-row max-w-5xl">
				{#each linesObject.templatePage as line, i}
					<pre data-prefix={i + 1} class="flex flex-row"><code use:formatElement>{line}</code></pre>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style lang="postcss">
	:global(.hljs) {
		background: oklch(var(--n));
		padding: 0 !important;
	}
</style>