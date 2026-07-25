type BottomNavigationProps = {
  currentPage: string;
  onChangePage: (page: string) => void;
};

export default function BottomNavigation({
  currentPage,
  onChangePage,
}: BottomNavigationProps) {
  const items = [
    { id: "home", label: "🏠 Home" },
    { id: "tasks", label: "📋 Tasks" },
    { id: "wallet", label: "👛 Wallet" },
    { id: "community", label: "👥 Community" },
    { id: "profile", label: "👤 Profile" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: "#1e293b",
        borderTop: "1px solid #334155",
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChangePage(item.id)}
          style={{
            background: "none",
            border: "none",
            color: currentPage === item.id ? "#38bdf8" : "#ffffff",
            fontWeight: currentPage === item.id ? "bold" : "normal",
            cursor: "pointer",
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
