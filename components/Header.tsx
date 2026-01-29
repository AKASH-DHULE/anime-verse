import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-gray-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-accent rounded">A</div>
          <span className="font-bold">ANIMECOMPASS</span>
        </Link>
        <nav className="space-x-4 text-sm">
          <Link href="/">Home</Link>
          <Link href="/search">Search</Link>
          <Link href="/watch-order">Watch Order</Link>
          <Link href="/favorites">Favorites</Link>
        </nav>
      </div>
    </header>
  );
}
