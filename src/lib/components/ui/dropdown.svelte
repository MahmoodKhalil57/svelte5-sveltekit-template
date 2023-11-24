<script lang="ts">
	export let id: string;
	export let label: string;
</script>

<div class="p-0 m-0 dropdown dropdown-bottom !bg-inherit">
	<label tabindex="-1" for={id} class="btn">{label}</label>
	<ul
		tabindex="-1"
		{id}
		class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box m-0 w-[130%]"
	>
		<slot />
	</ul>
</div>
