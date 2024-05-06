<script lang="ts">
	import '../app.postcss';
</script>

<slot />

<svelte:head>
	<meta name="author" content="Mahmood Khalil" />
	<meta name="publisher" content="Mahmood Khalil" />

	<title>Svelte Template</title>

	<meta name="application-name" content="Svelte Template" />
	<meta name="description" content="This template website" />
	<meta name="theme-color" content="#158811" />
	<meta name="keywords" content="svelte, template, tailwind, daisyui, prisma, luciaAuth" />

	<meta http-equiv="content-language" content="en" />
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="robots" content="index, follow" />
	<meta name="audience" content="Everyone" />

	<link rel="manifest" crossorigin="use-credentials" href="/manifest.json" />
	<link rel="icon" href="/pwa-192x192.png" />
	<link rel="mask-icon" href="/maskable-icon-512x512.png" color="#ffffff" />
	<link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" sizes="180x180" />
</svelte:head>
