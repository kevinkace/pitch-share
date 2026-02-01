import Papa from 'papaparse';

export async function load({ fetch, params }) {
  const response = await fetch(`/session/${params.session}.csv`);

  if (response.ok) {
    const csv = await response.text();

    // trim leading blank links
    const trimmedCsv = csv
      .split('\n')
      .filter(line => !(line.replaceAll(',', '').trim() === ''))
      .join('\n');

    const parsed = Papa.parse(trimmedCsv, { header: true }).data;

    return { csv, parsed };
  }

  return { session: null };
}
