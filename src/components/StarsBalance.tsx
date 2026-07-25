type Props = {
  stars: number;
};

export default function StarsBalance({ stars }: Props) {
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "20px",
        textAlign: "center",
      }}
    >
      <h3>⭐ Available Stars</h3>

      <h1>{stars}</h1>
    </div>
  );
}
