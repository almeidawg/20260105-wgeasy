import React, { useEffect, useState } from "react";

// Exemplo de chamada ao backend para buscar notas do Keep
async function fetchKeepNotes() {
  const res = await fetch("/api/keep/notes");
  return res.json();
}

export default function GoogleKeepChecklist() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKeepNotes()
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erro ao carregar checklist do Google Keep.");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div
        style={{
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Carregando checklist do Google Keep...
      </div>
    );

  if (error) {
    // Força conteúdo de teste para validação visual
    const fakeNotes = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      title: `Tarefa ${i + 1}`,
      text: `Descrição da tarefa ${i + 1}`,
    }));
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>
          Checklist Diário (Google Keep)
        </h2>
        <div
          style={{
            flex: 1,
            minHeight: 120,
            maxHeight: "350px",
            overflowY: "auto",
            border: "1px solid #eee",
            borderRadius: "8px",
            padding: "12px",
            background: "#fff",
          }}
        >
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {fakeNotes.map((note) => (
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
        <div style={{ color: "#d94d1f", textAlign: "center", marginTop: 8 }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8 }}>
        Checklist Diário (Google Keep)
      </h2>
      <div
        style={{
          flex: 1,
          minHeight: 120,
          maxHeight: "350px",
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "12px",
          background: "#fff",
        }}
      >
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {notes.length === 0 ? (
            <li style={{ color: "#888", textAlign: "center" }}>
              Nenhum item encontrado.
            </li>
          ) : (
            notes.map((note) => (
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
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
