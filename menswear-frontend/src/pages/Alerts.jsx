import { useEffect, useState } from "react";
import API from "../api/axios";

export default function Alerts() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/alerts").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Alerts</h1>

      <Section title="🚨 Low Stock">
        {data.lowStock.map((p, i) => (
          <Row key={i} name={p.sku} value={`Stock: ${p.stockQty}`} />
        ))}
      </Section>

      <Section title="❌ Out of Stock">
        {data.outOfStock.map((p, i) => (
          <Row key={i} name={p.sku} />
        ))}
      </Section>

      <Section title="🧊 Dead Stock">
        {data.deadStock.map((p, i) => (
          <Row key={i} name={p.sku} value={`Stock: ${p.stockQty}`} />
        ))}
      </Section>

      <Section title="🔥 Fast Selling (Restock Soon)">
        {data.fastSelling.map((p, i) => (
          <Row
            key={i}
            name={p.name}
            value={`Sold: ${p.sold}`}
            extra={`Stock: ${p.stock}`}
          />
        ))}
      </Section>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="mb-6 bg-white p-4 rounded shadow">
    <h2 className="font-bold mb-3">{title}</h2>
    {children.length ? children : <p>No alerts</p>}
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
