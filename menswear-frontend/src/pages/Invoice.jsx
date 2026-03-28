import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function Invoice() {
  const { id } = useParams(); // ✅ saleId from URL
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await API.get(`/sales/${id}`); // backend should return sale with items
        setSale(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch invoice");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  if (loading)
    return <div className="mt-20 text-center">Loading invoice...</div>;
  if (!sale) return <div className="mt-20 text-center">Invoice not found</div>;

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Invoice</h1>
      <div className="mb-4">
        <strong>Invoice Number:</strong> {sale.invoiceNumber}
        <br />
        <strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}
      </div>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1 text-left">SKU</th>
            <th className="border px-2 py-1 text-left">Qty</th>
            <th className="border px-2 py-1 text-left">Price</th>
            <th className="border px-2 py-1 text-left">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item._id}>
              <td className="border px-2 py-1">
                {item.sku || item.variantId?.sku}
              </td>
              <td className="border px-2 py-1">{item.qty}</td>
              <td className="border px-2 py-1">₹ {item.price}</td>
              <td className="border px-2 py-1">₹ {item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-4">
        <div>Total Amount: ₹ {sale.totalAmount}</div>
        <div>Discount: ₹ {sale.discount}</div>
        <div className="font-bold text-lg">
          Final Amount: ₹ {sale.finalAmount}
        </div>
      </div>

      <button
        onClick={printInvoice}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Print Invoice
      </button>
    </div>
  );
}
