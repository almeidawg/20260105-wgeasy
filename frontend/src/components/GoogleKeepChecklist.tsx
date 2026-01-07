import React, { useEffect, useState } from "react";

// Exemplo de chamada ao backend para buscar notas do Keep
async function fetchKeepNotes() {
  const res = await fetch("/api/keep/notes");
  return res.json();
}

export default function GoogleKeepChecklist() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKeepNotes().then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Carregando checklist do Google Keep...</div>;

  return (
    <div>
      <h2>Checklist Diário (Google Keep)</h2>
      <div
        style={{
          maxHeight: "350px",
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "12px",
        }}
      >
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                marginBottom: "16px",
                paddingBottom: "8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <strong>{note.title}</strong>
              <br />
              <span>{note.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
