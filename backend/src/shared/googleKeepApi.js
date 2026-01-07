// Google Keep API Proxy via Apps Script
// Este arquivo consome o endpoint REST do Apps Script para Google Keep
const fetch = require("node-fetch");

const GOOGLE_KEEP_SCRIPT_URL = process.env.GOOGLE_KEEP_SCRIPT_URL;

async function listNotes(token) {
  const res = await fetch(`${GOOGLE_KEEP_SCRIPT_URL}/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function createNote(token, note) {
  const res = await fetch(`${GOOGLE_KEEP_SCRIPT_URL}/notes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });
  return res.json();
}

async function updateNote(token, noteId, note) {
  const res = await fetch(`${GOOGLE_KEEP_SCRIPT_URL}/notes/${noteId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });
  return res.json();
}

// Sincroniza notas do Google Keep ao logar
async function syncNotesOnLogin(token) {
  try {
    const notes = await listNotes(token);
    // Aqui você pode salvar as notas no banco local, cache ou retornar para o frontend
    // Exemplo: return notes;
    return notes;
  } catch (err) {
    console.error("Erro ao sincronizar notas do Keep:", err);
    return [];
  }
}

module.exports = { listNotes, createNote, updateNote, syncNotesOnLogin };
