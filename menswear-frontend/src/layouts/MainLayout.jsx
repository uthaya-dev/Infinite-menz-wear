import { Outlet, Link, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();

  const links = [
    { path: "/", label: "Dashboard" },
    { path: "/masters", label: "Master Data" },
    { path: "/reports", label: "Reports" },
    { path: "/analytics", label: "Analytics" },
    { path: "/alerts", label: "Alerts" },
    { path: "/products", label: "Products" },
    { path: "/sales", label: "Sales" },
    { path: "/purchases", label: "Purchases" },
    { path: "/invoice", label: "Invoice" },
  ];

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8">Shop Admin</h2>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded hover:bg-gray-700 transition ${
                location.pathname === link.path
                  ? "bg-gray-800 font-semibold"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
