interface CardProps {
  children: React.ReactNode;
}

export function Card({ children }: CardProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: "22px 26px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        marginBottom: 20
      }}
    >
      {children}
    </div>
  );
}
