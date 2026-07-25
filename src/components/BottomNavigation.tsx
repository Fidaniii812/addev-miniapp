export default function BottomNavigation() {
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
        color: "#ffffff",
        borderTop: "1px solid #334155",
      }}
    >
      <span>🏠 Home</span>
      <span>📋 Tasks</span>
      <span>👛 Wallet</span>
      <span>👤 Profile</span>
    </nav>
  );
}
