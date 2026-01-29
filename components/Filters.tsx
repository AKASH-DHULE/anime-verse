import type { Genre } from '../types/genre';

export default function Filters({ genres, years }: { genres?: Genre[]; years?: number[] }) {
  return (
    <div className="flex gap-4 items-center">
      <select className="bg-gray-900 border border-gray-800 p-2 rounded">
        <option value="">All Genres</option>
        {genres?.map((g) => (
          <option key={g.mal_id} value={g.mal_id}>{g.name}</option>
        ))}
      </select>

      <select className="bg-gray-900 border border-gray-800 p-2 rounded">
        <option value="">All Years</option>
        {years?.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  );
}
