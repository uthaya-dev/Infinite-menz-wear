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

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");

  const [editPrimary, setEditPrimary] = useState("");
  const [editSecondary, setEditSecondary] = useState("");

  // Fetch masters
  const fetchMasters = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/masters/${type}`);
      setMasters(res.data || []);
    } catch (err) {
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();

    // reset fields on type change
    setName("");
    setPrimaryColor("");
    setSecondaryColor("");
  }, [type]);

  // Add
  const handleAdd = async () => {
    try {
      if (type === "color") {
        if (!primaryColor.trim()) return alert("Primary color required");

        const exists = masters.some(
          (m) =>
            m.primaryColor === primaryColor.trim() &&
            (m.secondaryColor || "") === (secondaryColor.trim() || ""),
        );

        if (exists) return alert("Color already exists");

        await API.post("/masters", {
          type,
          primaryColor,
          secondaryColor,
        });

        setPrimaryColor("");
        setSecondaryColor("");
      } else {
        if (!name.trim()) return alert("Enter name");

        const exists = masters.some(
          (m) => m.name.toLowerCase() === name.trim().toLowerCase(),
        );

        if (exists) return alert(`${type} already exists`);

        await API.post("/masters", {
          name: name.trim(),
          type,
        });

        setName("");
      }

      fetchMasters();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // Update
  const handleUpdate = async (id) => {
    try {
      if (type === "color") {
        if (!editPrimary.trim()) return alert("Primary color required");

        await API.put(`/masters/${id}`, {
          type,
          primaryColor: editPrimary,
          secondaryColor: editSecondary,
        });
      } else {
        if (!editName.trim()) return alert("Enter name");

        await API.put(`/masters/${id}`, {
          name: editName,
        });
      }

      setEditId(null);
      fetchMasters();
    } catch (err) {
      alert("Update failed");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await API.delete(`/masters/${id}`);
      fetchMasters();
    } catch {
      alert("Delete failed");
    }
  };

  const handleDeleteAll = async () => {
    const confirm1 = window.confirm(
      `Are you sure you want to delete ALL ${type}?`,
    );
    if (!confirm1) return;

    // 🔥 Second safety layer
    const confirmText = prompt(`Type DELETE to confirm removing all ${type}`);

    if (confirmText !== "DELETE") {
      alert("Action cancelled");
      return;
    }

    try {
      await API.delete(`/masters/type/${type}`);
      fetchMasters();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Master Data</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow space-y-4 max-w-xl">
        <h2 className="text-lg font-semibold">Add New Master</h2>

        {/* TYPE */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          {MASTER_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* INPUTS */}
        {type === "color" ? (
          <>
            <input
              placeholder="Primary Color *"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <input
              placeholder="Secondary Color (optional)"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </>
        ) : (
          <input
            placeholder={`Enter ${type}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        )}

        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <button
        onClick={handleDeleteAll}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Delete All {type}
      </button>

      {/* TABLE */}
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {masters.map((m) => (
            <tr key={m._id} className="border-b">
              <td className="p-2">
                {editId === m._id ? (
                  type === "color" ? (
                    <>
                      <input
                        value={editPrimary}
                        onChange={(e) => setEditPrimary(e.target.value)}
                        className="border px-2 mr-2"
                      />
                      <input
                        value={editSecondary}
                        onChange={(e) => setEditSecondary(e.target.value)}
                        className="border px-2"
                      />
                    </>
                  ) : (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border px-2"
                    />
                  )
                ) : type === "color" ? (
                  `${m.primaryColor}${
                    m.secondaryColor ? " / " + m.secondaryColor : ""
                  }`
                ) : (
                  m.name
                )}
              </td>

              <td className="p-2 space-x-2">
                {editId === m._id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(m._id)}
                      className="text-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="text-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditId(m._id);
                        if (type === "color") {
                          setEditPrimary(m.primaryColor || "");
                          setEditSecondary(m.secondaryColor || "");
                        } else {
                          setEditName(m.name);
                        }
                      }}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(m._id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Masters;
