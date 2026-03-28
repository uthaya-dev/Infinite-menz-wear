export const VariantForm = ({ variant, sizes, colors, onChange, onRemove }) => (
  <div className="flex gap-2 items-center mb-1">
    <select
      value={variant.size}
      onChange={(e) => onChange("size", e.target.value)}
      className="border p-1"
    >
      <option value="">Size</option>
      {sizes.map((s) => (
        <option key={s._id} value={s.name}>
          {s.name}
        </option>
      ))}
    </select>

    <select
      value={variant.color}
      onChange={(e) => onChange("color", e.target.value)}
      className="border p-1"
    >
      <option value="">Color</option>
      {colors.map((c) => (
        <option key={c._id} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>

    <input
      type="number"
      min="0"
      placeholder="Stock"
      value={variant.stockQty}
      onChange={(e) => onChange("stockQty", parseInt(e.target.value))}
      className="border p-1 w-20"
    />
    <input
      type="number"
      min="0"
      placeholder="Purchase"
      value={variant.purchasePrice}
      onChange={(e) => onChange("purchasePrice", parseFloat(e.target.value))}
      className="border p-1 w-24"
    />
    <input
      type="number"
      min="0"
      placeholder="Selling"
      value={variant.sellingPrice}
      onChange={(e) => onChange("sellingPrice", parseFloat(e.target.value))}
      className="border p-1 w-24"
    />

    <button className="text-red-500" onClick={onRemove}>
      Remove
    </button>
  </div>
);
