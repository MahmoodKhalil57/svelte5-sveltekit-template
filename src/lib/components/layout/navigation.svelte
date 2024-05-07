<!-- svelte-ignore export_let_unused -->
<script lang="ts">
	let {
		menu = false
	}: {
		menu?: boolean;
	} = $props();

	const links = [
		{
			text: 'Home',
			href: '/'
		}
	];
</script>

{#each links as { href, text }}
	<li>
		<a {href}>{text}</a>
	</li>
{/each}
