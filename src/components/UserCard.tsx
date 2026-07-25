type UserCardProps = {
  firstName: string;
  username?: string;
  userId?: number;
};

export default function UserCard({
  firstName,
  username,
  userId,
}: UserCardProps) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px",
      }}
    >
      <h2>👤 Telegram User</h2>

      <p>
        <strong>Name:</strong> {firstName}
      </p>

      <p>
        <strong>Username:</strong>{" "}
        {username ? `@${username}` : "Not available"}
      </p>

      <p>
        <strong>User ID:</strong> {userId ?? "Unknown"}
      </p>
    </div>
  );
}
