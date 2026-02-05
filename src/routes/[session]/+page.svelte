<script lang="ts">
	import { page } from '$app/stores';
    import AgGridSvelte5Component from 'ag-grid-svelte5';
    import type { GridOptions } from 'ag-grid-community';
import { themeQuartz } from '@ag-grid-community/theming';
    const { data } = $props(); // Access the returned data

    interface RowData1 {
        Count: number;
        Speed: number;
        Time: string;
    }

    const gridOptions = {
        columnDefs: [
            { field: 'Count' },
            { field: 'Speed' },
            { field: 'Time' }
        ]
    };

</script>

<h1>session {$page.params.session}</h1>

<AgGridSvelte5Component {gridOptions} rowData={data.parsed} theme={themeQuartz} />

<pre>{JSON.stringify(data.parsed, null, 2)}</pre>
