import Link from "next/link"

export default function Header() {
  return (
    <header>
        <Link href="/">
          <h1>Pitch Share</h1>
        </Link>
      <p>Baseball pitching session analysis and tracking</p>
    </header>
  );
}