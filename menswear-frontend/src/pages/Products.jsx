import { useEffect, useState } from "react";
import API from "../api/axios";
import CustomSelect from "../components/CustomSelect";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [masters, setMasters] = useState({
    categories: [],
    sizes: [],
    colors: [],
    brands: [],
  });
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    description: "",
    variants: [],
  });
  const [editingVariant, setEditingVariant] = useState(null); // { productId, variantId, ... }
  const [editingProductId, setEditingProductId] = useState(null);
  const [colorSearch, setColorSearch] = useState("");
  const [showColorDropdown, setShowColorDropdown] = useState(null); // index

  // Fetch products and master data
  const fetchData = async () => {
    const [productRes, categoryRes, sizeRes, colorRes, brandRes] =
      await Promise.all([
        API.get("/products"),
        API.get("/masters/category"),
        API.get("/masters/size"),
        API.get("/masters/color"),
        API.get("/masters/brand"),
      ]);

    setProducts(productRes.data);
    setMasters({
      categories: categoryRes.data,
      sizes: sizeRes.data,
      colors: colorRes.data,
      brands: brandRes.data,
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add a new empty variant
  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        { size: "", color: "", stockQty: 0, purchasePrice: 0, sellingPrice: 0 },
      ],
    });
  };

  // Update variant values
  const updateVariant = (index, key, value) => {
    const updated = [...form.variants];
    updated[index][key] = value;
    setForm({ ...form, variants: updated });
  };
  const handleEditProduct = (p) => {
    setEditingProductId(p._id);
    console.log(p, "p");
    setForm({
      name: p.name,
      categoryId: p.categoryId?._id || "",
      brandId: p.brandId?._id || "",
      description: p.description || "",
      variants: p.variants.map((v) => ({
        size: v.size,
        color: v.color,
      })),
    });
  };
  // Edit variant
  const handleEditVariant = async () => {
    if (!editingVariant) return;
    const {
      productId,
      variantId,
      size,
      color,
      stockQty,
      purchasePrice,
      sellingPrice,
    } = editingVariant;

    try {
      await API.put(`/products/${productId}/variant/${variantId}`, {
        size,
        color,
        stockQty,
        purchasePrice,
        sellingPrice,
      });
      alert("Variant updated successfully");
      setEditingVariant(null);
      fetchData();
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  // Remove variant
  const removeVariant = (index) => {
    const updated = [...form.variants];
    updated.splice(index, 1);
    setForm({ ...form, variants: updated });
  };

  const getColorPriority = (color) => {
    const c = color?.toLowerCase() || "";

    if (c.includes("white")) return 1;
    if (c.includes("black")) return 2;
    return 3;
  };

  // Submit product
  const handleSubmit = async () => {
    if (!form.name || !form.categoryId || form.variants.length === 0)
      return alert("Fill required fields");

    try {
      if (editingProductId) {
        // ✅ UPDATE EXISTING PRODUCT
        await API.put(`/products/${editingProductId}`, form);
        alert("Product updated successfully!");
      } else {
        // ✅ CREATE NEW PRODUCT
        await API.post("/products", form);
        alert("Product created successfully!");
      }

      // Reset form
      setForm({
        name: "",
        categoryId: "",
        brandId: "",
        description: "",
        variants: [],
      });

      setEditingProductId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await API.delete(`/products/${id}`);
    fetchData();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      {/* Create Product Form */}
      <div className="p-4 border rounded mb-6 bg-white">
        <h2 className="font-bold mb-2">Add New Product</h2>

        {/* Product Name */}
        <input
          type="text"
          placeholder="Product Name"
          className="border p-1 mr-2 mb-2"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Category Select */}
        <div className="inline-block mr-2 mb-2 w-48">
          <CustomSelect
            options={masters.categories.map((c) => ({
              value: c._id,
              label: c.name,
            }))}
            value={form.categoryId}
            onChange={(val) => setForm({ ...form, categoryId: val })}
            placeholder="Select Category"
          />
        </div>

        {/* Brand Select */}
        <div className="inline-block mr-2 mb-2 w-48">
          <CustomSelect
            options={masters.brands.map((b) => ({
              value: b._id,
              label: b.name,
            }))}
            value={form.brandId}
            onChange={(val) => setForm({ ...form, brandId: val })}
            placeholder="Select Brand"
          />
        </div>

        {/* Description */}
        <input
          type="text"
          placeholder="Description"
          className="border p-1 mr-2 mb-2 w-full"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Variants */}
        <div className="mt-2 mb-2">
          <h3 className="font-semibold">Variants</h3>

          {form.variants.map((v, idx) => (
            <div key={idx} className="flex gap-2 items-center mb-2">
              {/* Size */}
              <CustomSelect
                options={masters.sizes.map((s) => ({
                  value: s.name,
                  label: s.name,
                }))}
                value={v.size}
                onChange={(val) => updateVariant(idx, "size", val)}
                placeholder="Select Size"
              />

              {/* Color */}
              <CustomSelect
                options={masters.colors.map((c) => {
                  const label = `${c.primaryColor}${
                    c.secondaryColor ? " / " + c.secondaryColor : ""
                  }`;

                  return {
                    value: label,
                    label,
                  };
                })}
                value={v.color}
                onChange={(val) => updateVariant(idx, "color", val)}
                placeholder="Select Color"
              />

              {/* Remove */}
              <button
                className="text-red-500 hover:underline"
                onClick={() => removeVariant(idx)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
            onClick={addVariant}
          >
            Add Variant
          </button>
        </div>

        {/* Submit */}
        <button
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          {editingProductId ? "Update Product" : "Create Product"}
        </button>
      </div>
      {/* Products List */}
      <div className="grid grid-cols-1 gap-4">
        {products.map((p) => (
          <div key={p._id} className="p-4 border rounded bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">
                {p.name} ({p.categoryId?.name || "-"})
              </h3>

              <div className="flex gap-2">
                <button
                  className="text-blue-500"
                  onClick={() => handleEditProduct(p)}
                >
                  Edit Product
                </button>

                <button
                  className="text-red-500"
                  onClick={() => handleDelete(p._id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <p>{p.description}</p>
            <div className="mt-2">
              {[...p.variants]
                .sort((a, b) => {
                  return getColorPriority(a.color) - getColorPriority(b.color);
                })
                .map((v) => (
                  <div
                    key={v._id}
                    className="flex gap-2 items-center text-sm mb-1"
                  >
                    <span>{v.sku}</span>
                    <span>Size: {v.size}</span>
                    <span>
                      Color:{" "}
                      {v.primaryColor
                        ? `${v.primaryColor}${
                            v.secondaryColor ? " / " + v.secondaryColor : ""
                          }`
                        : v.color}
                    </span>
                    <span>Stock: {v.stockQty}</span>
                    <span>Purchase: ₹{v.purchasePrice}</span>
                    <span>Selling: ₹{v.sellingPrice}</span>
                    <button
                      className="text-blue-500"
                      onClick={() =>
                        setEditingVariant({
                          productId: p._id,
                          variantId: v._id,
                          size: v.size,
                          color: v.color,
                          stockQty: v.stockQty,
                          purchasePrice: v.purchasePrice,
                          sellingPrice: v.sellingPrice,
                        })
                      }
                    >
                      Edit
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {editingVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-96">
            <h3 className="font-bold mb-2">Edit Variant</h3>
            <select
              value={editingVariant.size}
              onChange={(e) =>
                setEditingVariant({ ...editingVariant, size: e.target.value })
              }
              className="border p-1 mb-2 w-full"
            >
              <option value="">Select Size</option>
              {masters.sizes.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={editingVariant.color}
              onChange={(e) =>
                setEditingVariant({ ...editingVariant, color: e.target.value })
              }
              className="border p-1 mb-2 w-full"
            >
              <option value="">Select Color</option>

              {masters.colors.map((c) => {
                const display = `${c.primaryColor}${
                  c.secondaryColor ? " / " + c.secondaryColor : ""
                }`;

                return (
                  <option key={c._id} value={display}>
                    {display}
                  </option>
                );
              })}
            </select>
            <input
              type="number"
              placeholder="Stock Qty"
              value={editingVariant.stockQty}
              onChange={(e) =>
                setEditingVariant({
                  ...editingVariant,
                  stockQty: parseInt(e.target.value),
                })
              }
              className="border p-1 mb-2 w-full"
            />
            <input
              type="number"
              placeholder="Purchase Price"
              value={editingVariant.purchasePrice}
              onChange={(e) =>
                setEditingVariant({
                  ...editingVariant,
                  purchasePrice: parseFloat(e.target.value),
                })
              }
              className="border p-1 mb-2 w-full"
            />
            <input
              type="number"
              placeholder="Selling Price"
              value={editingVariant.sellingPrice}
              onChange={(e) =>
                setEditingVariant({
                  ...editingVariant,
                  sellingPrice: parseFloat(e.target.value),
                })
              }
              className="border p-1 mb-2 w-full"
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-300 px-2 py-1 rounded"
                onClick={() => setEditingVariant(null)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-2 py-1 rounded"
                onClick={handleEditVariant}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
