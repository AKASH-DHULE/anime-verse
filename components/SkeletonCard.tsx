export default function SkeletonCard() {
  return (
    <div className="bg-gray-900 rounded overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-4">
        <div className="h-4 w-3/4 skeleton mb-3" />
        <div className="h-3 w-1/4 skeleton" />
      </div>
    </div>
  );
}
