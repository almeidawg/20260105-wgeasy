export default function Topbar() {
  return (
    <header
      style={{
        height: "64px",
        background: "#FFF",
        borderBottom: "1px solid #E5E5E5",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        left: "240px",
        right: 0,
        top: 0,
        zIndex: 10,
      }}
    >
      <h3 style={{ margin: 0 }}>Painel Operacional</h3>

      <div>
        <span style={{ fontWeight: "bold" }}>William Almeida</span>
      </div>
    </header>
  );
}
