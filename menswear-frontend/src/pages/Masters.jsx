import { useEffect, useState } from "react";
import API from "../api/axios";

const MASTER_TYPES = [
  { value: "category", label: "Category" },
  { value: "size", label: "Size" },
  { value: "color", label: "Color" },
  { value: "brand", label: "Brand" },
  { value: "supplier", label: "Supplier" },
];

const Masters = () => {
  const [type, setType] = useState("category");
  const [name, setName] = useState("");
  const [masters, setMasters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch masters
  const fetchMasters = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/masters/${type}`);
      setMasters(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, [type]);

  // Add master
  const handleAdd = async () => {
    if (!name.trim()) return alert("Enter name");

    try {
      await API.post("/masters", {
        name: name.trim(),
        type,
      });

      setName("");
      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding item");
    }
  };

  // Delete master
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/masters/${id}`);
      fetchMasters();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Master Data</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow space-y-4 max-w-xl">
        <h2 className="text-lg font-semibold">Add New Master</h2>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
          >
            {MASTER_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {MASTER_TYPES.find((t) => t.value === type)?.label} Name
          </label>
          <input
            type="text"
            placeholder={`Enter ${type} name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded shadow"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow rounded overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {masters.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              masters.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-2 capitalize">{m.name}</td>
                  <td className="px-4 py-2 capitalize">{type}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Masters;
