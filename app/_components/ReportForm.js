"use client";
import { useState } from "react";

export default function ReportForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    category: "power",
    description: "",
    location_name: "",
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);

  const useMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({
        ...f,
        latitude: +pos.coords.latitude.toFixed(6),
        longitude: +pos.coords.longitude.toFixed(6),
      }));
    });
  };

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const { data } = await res.json();
      onCreated?.(data);
      setForm({
        title: "",
        category: "power",
        description: "",
        location_name: "",
        latitude: null,
        longitude: null,
      });
    } else {
      alert("Failed to create report");
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl border">
      <input
        className="w-full border rounded-lg p-2"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <select
        className="w-full border rounded-lg p-2"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        <option value="security">Security</option>
        <option value="road">Road</option>
        <option value="power">Power</option>
        <option value="health">Health</option>
      </select>
      <textarea
        className="w-full border rounded-lg p-2"
        rows={3}
        placeholder="Describe…"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2"
          placeholder="Location name (optional)"
          value={form.location_name}
          onChange={(e) => setForm({ ...form, location_name: e.target.value })}
        />
        <button
          onClick={useMyLocation}
          type="button"
          className="px-3 py-2 rounded-lg border"
        >
          Use my location
        </button>
      </div>
      <div className="text-xs text-gray-500">
        Lat: {form.latitude ?? "-"} Lng: {form.longitude ?? "-"}
      </div>
      <button
        disabled={loading}
        onClick={submit}
        className="px-4 py-2 rounded-lg bg-red-500 text-white"
      >
        {loading ? "Submitting…" : "Submit Report"}
      </button>
    </div>
  );
}
