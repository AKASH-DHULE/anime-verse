export default function Hero() {
  return (
    <section className="relative mt-8 mb-12">
      <div className="h-64 md:h-96 rounded-md overflow-hidden bg-[url('/hero.jpg')] bg-cover bg-center opacity-80 flex items-center justify-center">
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-wide drop-shadow-lg">DISCOVER ANIME</h1>
      </div>
      <p className="mt-4 text-gray-300">Explore the best anime series, track watch orders, and build your ultimate watchlist.</p>
    </section>
  );
}
