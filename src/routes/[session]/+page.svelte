<script>
	import { page } from '$app/stores';

    // fetch data from static
    $: console.log($page.params.session);

    export let data; // Access the returned data

</script>

<h1>session {$page.params.session}</h1>

<pre>{JSON.stringify(data.parsed, null, 2)}</pre>

<pre>{data.csv}</pre>