import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Reports() {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const fetchReport = async () => {
    const res = await API.get(
      `/reports/sales?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=5`,
    );
    setData(res.data);
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <input type="date" onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={fetchReport} className="bg-blue-500 text-white px-4">
          Get Report
        </button>
      </div>

      {/* Summary */}
      {data && (
        <div className="mb-4">
          <p>Total Sales: ₹{data.totalSales}</p>
          <p>Profit: ₹{data.profit}</p>
          <p>Orders: {data.count}</p>
        </div>
      )}

      {/* Table */}
      {data?.sales?.map((s) => (
        <div key={s._id} className="border p-3 mb-3 rounded">
          <p>
            <b>Invoice:</b> {s.invoiceNumber}
          </p>
          <p>
            <b>Date:</b> {new Date(s.createdAt).toLocaleDateString()}
          </p>
          <p>
            <b>Amount:</b> ₹{s.finalAmount}
          </p>
          <p>
            <b>Payment:</b> {s.paymentMethod}
          </p>
          <p>
            <b>Discount:</b> ₹{s.discount}
          </p>

          <div className="mt-2 ml-4">
            <b>Items:</b>
            {s.items.map((i, idx) => (
              <div key={idx} className="text-sm">
                {i.name} — {i.qty} × ₹{i.price}
              </div>
            ))}
          </div>
        </div>
      ))}

      {data && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-300"
          >
            Prev
          </button>

          <span>
            Page {data.currentPage} / {data.totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === data.totalPages}
            className="px-3 py-1 bg-gray-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
