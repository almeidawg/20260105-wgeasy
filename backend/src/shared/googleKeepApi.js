// Google Keep API Proxy via Apps Script
// Este arquivo consome o endpoint REST do Apps Script para Google Keep
const fetch = require("node-fetch");
const { getServiceAccountAccessToken } = require("./googleAuth.ts");

const GOOGLE_KEEP_SCRIPT_URL = process.env.GOOGLE_KEEP_SCRIPT_URL;
const KEEP_SCOPES = ["https://www.googleapis.com/auth/keep"];

let cachedToken = null;
let tokenExpiry = 0;

async function getAuthToken() {
  if (!GOOGLE_KEEP_SCRIPT_URL) {
    throw new Error("GOOGLE_KEEP_SCRIPT_URL não configurado");
  }

  const now = Date.now();
  if (cachedToken && tokenExpiry > now + 30 * 1000) {
    return cachedToken;
  }

  const override = process.env.GOOGLE_KEEP_ACCESS_TOKEN;
  if (override) {
    cachedToken = override;
    tokenExpiry = now + 60 * 60 * 1000;
    return cachedToken;
  }

  const serviceToken = await getServiceAccountAccessToken(KEEP_SCOPES);
  if (!serviceToken) {
    throw new Error("Service Account do Keep não configurada");
  }

  cachedToken = serviceToken.accessToken;
  tokenExpiry = now + 45 * 60 * 1000;
  return cachedToken;
}

async function doFetch(path, options = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${GOOGLE_KEEP_SCRIPT_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Keep API retornou ${res.status}: ${text}`);
  }

  return res.json();
}

async function listNotes() {
  return doFetch("/notes");
}

async function createNote(note) {
  return doFetch("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
}

async function updateNote(noteId, note) {
  return doFetch(`/notes/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
}

async function syncNotesOnLogin() {
  try {
    return await listNotes();
  } catch (error) {
    console.error("Erro ao sincronizar notas do Keep:", error);
    return [];
  }
}

module.exports = { listNotes, createNote, updateNote, syncNotesOnLogin };
