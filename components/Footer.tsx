export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-8">
      <div className="max-w-6xl mx-auto py-6 text-sm text-gray-400">
        © {new Date().getFullYear()} Anime Compass. Built with Jikan API.
      </div>
    </footer>
  );
}
