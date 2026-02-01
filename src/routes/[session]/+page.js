export async function load({ fetch, params }) {
  const response = await fetch(`/session/${params.session}.csv`);

  if (response.ok) {
    const session = await response.text();

    return { session };
  }

  return { session: null };
}
