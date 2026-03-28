import { useEffect, useState } from "react";
import API from "../api/axios";

const Purchases = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  const [items, setItems] = useState([]);

  // 🔹 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const [productRes, supplierRes] = await Promise.all([
        API.get("/products"),
        API.get("/masters/supplier"),
      ]);

      setProducts(productRes.data || []);
      setSuppliers(supplierRes.data || []);
    };

    fetchData();
  }, []);

  // 🔹 Get selected product object
  const productObj = products.find((p) => p._id === selectedProduct);

  // 🔹 Add item
  const handleAddItem = () => {
    if (!selectedVariant) return alert("Select variant");

    const variant = productObj?.variants.find((v) => v._id === selectedVariant);

    if (!variant) return;

    const existing = items.find((i) => i.variantId === variant._id);

    if (existing) {
      setItems(
        items.map((i) =>
          i.variantId === variant._id ? { ...i, qty: i.qty + qty } : i,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          variantId: variant._id,
          sku: variant.sku,
          qty,
          purchasePrice: price || variant.purchasePrice || 0,
        },
      ]);
    }

    // reset
    setSelectedVariant("");
    setQty(1);
    setPrice(0);
  };

  // 🔹 Remove item
  const removeItem = (variantId) => {
    setItems(items.filter((i) => i.variantId !== variantId));
  };

  // 🔹 Submit purchase
  const handleSubmit = async () => {
    if (!supplierId) return alert("Select supplier");
    if (items.length === 0) return alert("Add items");

    try {
      const res = await API.post("/purchases", {
        supplierId, // 🔥 better than name
        items: items.map((i) => ({
          variantId: i.variantId,
          qty: i.qty,
          purchasePrice: i.purchasePrice,
        })),
      });

      alert(`Purchase created! ID: ${res.data.purchaseId}`);

      // reset
      setSupplierId("");
      setItems([]);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Purchase</h1>

      {/* 🔹 FORM */}
      <div className="bg-white p-4 rounded shadow space-y-4 max-w-2xl">
        <h2 className="font-semibold text-lg">Purchase Details</h2>

        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium mb-1">Supplier</label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setSelectedVariant("");
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Variant */}
        <div>
          <label className="block text-sm font-medium mb-1">Variant</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            disabled={!selectedProduct}
          >
            <option value="">Select Variant</option>
            {productObj?.variants.map((v) => (
              <option key={v._id} value={v._id}>
                {v.sku} | {v.size} | {v.color}
              </option>
            ))}
          </select>
        </div>

        {/* Qty + Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Purchase Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddItem}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Item
        </button>
      </div>

      {/* 🔹 ITEMS TABLE */}
      {items.length > 0 && (
        <div className="bg-white p-4 rounded shadow max-w-2xl">
          <h2 className="font-semibold mb-2">Items</h2>

          {items.map((i) => (
            <div
              key={i.variantId}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                <p className="font-medium">{i.sku}</p>
                <p className="text-sm text-gray-500">
                  Qty: {i.qty} | Price: ₹{i.purchasePrice}
                </p>
              </div>

              <button
                onClick={() => removeItem(i.variantId)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            Complete Purchase
          </button>
        </div>
      )}
    </div>
  );
};

export default Purchases;
