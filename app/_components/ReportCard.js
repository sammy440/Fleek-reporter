export default function ReportCard({ r }) {
  return (
    <div className="p-4 border rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{r.title}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
          {r.category}
        </span>
      </div>
      <p className="text-sm text-gray-700 mt-2">{r.description}</p>
      <div className="text-xs text-gray-500 mt-2">
        {r.location_name ?? "Unknown"} ·{" "}
        {new Date(r.created_at).toLocaleString()}
      </div>
    </div>
  );
}
