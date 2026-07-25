export default function Profile() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <h2>Profile</h2>

      <p>Name: Guest</p>
      <p>Level: Beginner</p>
      <p>AdDev Points: 0</p>

      <button
        style={{
          padding: "12px 24px",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Edit Profile
      </button>
    </div>
  );
}
