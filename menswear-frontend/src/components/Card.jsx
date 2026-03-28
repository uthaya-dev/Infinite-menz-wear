const colors = {
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  yellow: "bg-yellow-500 text-white",
  red: "bg-red-500 text-white",
};

export const Card = ({ title, value, color }) => (
  <div
    className={`p-4 rounded shadow ${colors[color] || "bg-gray-500 text-white"}`}
  >
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);
