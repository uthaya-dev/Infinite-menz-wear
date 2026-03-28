import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    const res = await API.get(`/analytics?days=${days}`);
    setData(res.data);
  };

  if (!data) return <div className="p-6">Loading...</div>;
  const chartData = {
    labels: data.fastMoving.map((p) => p.name),
    datasets: [
      {
        label: "Units Sold",
        data: data.fastMoving.map((p) => p.sold),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
      {
        label: "Stock Available",
        data: data.fastMoving.map((p) => p.stock),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Top Products: Sales vs Stock",
      },
    },
  };
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>

      {/* FILTER */}
      <div className="mb-4">
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="border p-2"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card title="Total Products" value={data.kpis.totalVariants} />
        <Card title="Fast Moving" value={data.kpis.fastCount} />
        <Card title="Slow Moving" value={data.kpis.slowCount} />
        <Card title="Dead Stock" value={data.kpis.deadCount} />
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-3">Top Selling Products</h2>
        <Bar data={chartData} options={options} />
      </div>

      {/* SECTIONS */}
      <Section title="🔥 Fast Moving">
        {data.fastMoving.map((p, i) => (
          <Row
            key={i}
            name={p.name}
            value={`Sold: ${p.sold}`}
            extra={`Stock: ${p.stock}`}
          />
        ))}
      </Section>

      <Section title="🐢 Slow Moving">
        {data.slowMoving.map((p, i) => (
          <Row
            key={i}
            name={p.name}
            value={`Sold: ${p.sold}`}
            extra={`Stock: ${p.stock}`}
          />
        ))}
      </Section>

      <Section title="🧊 Dead Stock">
        {data.deadStock.map((p, i) => (
          <Row key={i} name={p.sku} value={`Stock: ${p.stockQty}`} />
        ))}
      </Section>

      <Section title="🏷️ Clearance">
        {data.clearance.map((p, i) => (
          <Row key={i} name={p.sku} value={`Stock: ${p.stockQty}`} />
        ))}
      </Section>
    </div>
  );
}

const Card = ({ title, value }) => (
  <div className="bg-indigo-500 text-white p-4 rounded">
    <h3>{title}</h3>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6 bg-white p-4 rounded shadow">
    <h2 className="font-bold mb-3">{title}</h2>
    {children.length ? children : <p>No data</p>}
  </div>
);

const Row = ({ name, value, extra }) => (
  <div className="flex justify-between border-b py-1">
    <span>{name}</span>
    <span>
      {value} {extra && `| ${extra}`}
    </span>
  </div>
);
