import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Sales = () => {
  const navigate = useNavigate(); // ✅ HERE
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");

  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  // ================= FETCH =================

  useEffect(() => {
    fetchProducts();

    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "F9") {
        handleSale();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [cart, discount]);

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const searchVariants = async (q) => {
    setQuery(q);

    if (!q) {
      setSearchResults([]);
      setActiveIndex(-1);
      return;
    }

    const res = await API.get(`/products/search-variants?q=${q}`);
    setSearchResults(res.data);
    setActiveIndex(0); // 🔥 default first item selected
  };

  // ================= HANDLE PRODUCT =================
  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    const product = products.find((p) => p._id === productId);
    setVariants(product?.variants || []);
    setSelectedVariant("");
  };

  // ================= ADD ITEM =================
  const handleAddItem = () => {
    if (!selectedVariant) return alert("Select variant");

    const variant = variants.find((v) => v._id === selectedVariant);

    const exists = cart.find((c) => c.variantId === variant._id);

    if (exists) {
      setCart(
        cart.map((c) =>
          c.variantId === variant._id ? { ...c, qty: c.qty + 1 } : c,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          variantId: variant._id,
          sku: variant.sku,
          qty: 1,
          price: variant.sellingPrice || 0, // ✅ auto fill
        },
      ]);
    }
  };

  const addVariantToCart = (variant) => {
    const exists = cart.find((c) => c.variantId === variant._id);

    if (exists) {
      setCart(
        cart.map((c) =>
          c.variantId === variant._id ? { ...c, qty: c.qty + 1 } : c,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          variantId: variant._id,
          sku: variant.sku,
          qty: 1,
          price: variant.price,
          stock: variant.stock,
        },
      ]);
    }

    setQuery("");
    setSearchResults([]);

    // 🔥 FOCUS BACK
    setTimeout(() => {
      searchRef.current?.focus();
    }, 0);
  };

  // ================= UPDATE =================
  const updateItem = (variantId, key, value) => {
    setCart(
      cart.map((c) => (c.variantId === variantId ? { ...c, [key]: value } : c)),
    );
  };

  const removeItem = (variantId) => {
    setCart(cart.filter((c) => c.variantId !== variantId));
  };

  // ================= TOTAL =================
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );

  const finalAmount = totalAmount - (discount || 0);

  // ================= SUBMIT =================
  const handleSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    try {
      const res = await API.post("/sales", {
        items: cart.map((c) => ({
          variantId: c.variantId,
          qty: c.qty,
          price: c.price,
        })),
        discount,
        paymentMethod: "cash",
      });

      alert(`Sale completed! Invoice: ${res.data.saleId}`);

      // Navigate to invoice page with saleId
      navigate(`/invoice/${res.data.saleId}`);

      // ✅ NOW res exists
      const saleData = {
        invoiceNumber: res.data.invoiceNumber,
        items: cart.map((c) => ({
          sku: c.sku,
          qty: c.qty,
          price: c.price,
          total: c.qty * c.price,
        })),
        totalAmount,
        discount,
        finalAmount,
      };

      console.log("NAVIGATING WITH:", saleData);

      // ✅ navigate AFTER API success
      navigate(`/invoice/${res.data.saleId}`);

      // reset
      setCart([]);
      setDiscount(0);
      setSelectedProduct("");
      setSelectedVariant("");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const increaseQty = (variantId) => {
    setCart((prev) =>
      prev.map((c) => {
        if (c.variantId !== variantId) return c;

        if (c.qty >= c.stock) {
          alert("Stock limit reached");
          return c;
        }

        return { ...c, qty: c.qty + 1 };
      }),
    );
  };

  const decreaseQty = (variantId) => {
    setCart((prev) =>
      prev
        .map((c) => (c.variantId === variantId ? { ...c, qty: c.qty - 1 } : c))
        .filter((c) => c.qty > 0),
    );
  };

  // ================= UI =================
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sales</h1>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        {/* PRODUCT */}
        <div>
          <label className="block font-medium mb-1">Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => handleProductChange(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* VARIANT */}
        <div>
          <label className="block font-medium mb-1">Variant</label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select Variant</option>
            {variants.map((v) => (
              <option key={v._id} value={v._id}>
                {v.sku} | {v.size} | {v.color} (Stock: {v.stockQty})
              </option>
            ))}
          </select>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={handleAddItem}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Item
        </button>
      </div>

      <div>
        <label className="block font-medium mb-1">Search</label>
        <input
          ref={searchRef}
          type="text"
          placeholder="Scan / Search..."
          value={query}
          onChange={(e) => searchVariants(e.target.value)}
          onKeyDown={(e) => {
            if (searchResults.length === 0) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) =>
                prev < searchResults.length - 1 ? prev + 1 : prev,
              );
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
            }

            if (e.key === "Enter") {
              e.preventDefault();
              if (activeIndex >= 0) {
                addVariantToCart(searchResults[activeIndex]);
              }
            }
          }}
          className="border p-2 w-full"
        />

        {/* RESULTS */}
        {searchResults.length > 0 && (
          <div
            ref={listRef}
            className="border mt-1 max-h-100 bg-white overflow-y-auto"
          >
            {searchResults.map((v, index) => (
              <div
                key={v._id}
                ref={(el) => {
                  if (index === activeIndex && el) {
                    el.scrollIntoView({ block: "nearest" });
                  }
                }}
                className={`p-2 cursor-pointer ${
                  index === activeIndex ? "bg-blue-200" : "hover:bg-gray-100"
                }`}
                onClick={() => addVariantToCart(v)}
              >
                <b>{v.productName}</b> ({v.size}/{v.color}) <br />
                {v.sku} — ₹{v.price} — Stock: {v.stock}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CART */}
      {cart.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Cart</h2>
          {cart.map((c) => (
            <div key={c.variantId} className="flex gap-2 mb-2 items-center">
              {/* NAME */}
              <span className="w-40">{c.sku}</span>

              {/* QTY CONTROLS */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(c.variantId)}
                  className="px-2 bg-gray-300"
                >
                  -
                </button>

                <span>{c.qty}</span>

                <button
                  onClick={() => increaseQty(c.variantId)}
                  className="px-2 bg-gray-300"
                >
                  +
                </button>
              </div>

              {/* PRICE */}
              <span className="w-24">₹ {c.price}</span>

              {/* TOTAL */}
              <span className="w-24 font-semibold">₹ {c.qty * c.price}</span>

              {/* REMOVE */}
              <button
                onClick={() => removeItem(c.variantId)}
                className="text-red-500"
              >
                ✕
              </button>
            </div>
          ))}

          {/* SUMMARY */}
          <div className="mt-4 space-y-2">
            <div>Total: ₹ {totalAmount}</div>

            <div>
              <label className="mr-2">Discount:</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value))}
                className="border w-24 p-1"
              />
            </div>

            <div className="font-bold text-lg">Final: ₹ {finalAmount}</div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSale}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Complete Sale
          </button>
        </div>
      )}
    </div>
  );
};

export default Sales;
