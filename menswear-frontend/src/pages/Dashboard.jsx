import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Shop Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <Card title="Today" value={data.todaySales} />
        <Card title="Week" value={data.weekSales} />
        <Card title="Month" value={data.monthSales} />
        <Card title="Total Sales" value={data.totalSales} />
        <Card title="Purchase" value={data.totalPurchase} />
        <Card title="Profit" value={data.profit} />
        <Card title="Low Stock" value={data.lowStockCount} />
        <Card title="Dead Stock" value={data.deadStockCount} />
        <Card title="Clearance" value={data.clearanceStockCount} />
      </div>

      {/* Top Products */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-3">Top Selling Products</h2>
        {data.topProducts.map((p, i) => (
          <div key={i} className="flex justify-between border-b py-1">
            <span>{p.name}</span>
            <span>{p.sold}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const Card = ({ title, value }) => (
  <div className="bg-blue-500 text-white p-4 rounded">
    <h3>{title}</h3>
    <p className="text-xl font-bold">₹{value}</p>
  </div>
);
