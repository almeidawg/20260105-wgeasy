#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const binaryName = process.platform === "win32" ? "cloudflared.exe" : "cloudflared";
const binaryPath = path.resolve(__dirname, binaryName);

if (!existsSync(binaryPath)) {
  console.error(`[tunel] Binario ${binaryName} nao encontrado em ${binaryPath}.`);
  console.error("[tunel] Baixe o cloudflared e coloque o executavel na pasta do frontend.");
  process.exit(1);
}

const port = process.env.TUNNEL_PORT || process.env.VITE_PORT || 5177;
const targetUrl = `http://localhost:${port}`;

const args = ["tunnel", "--url", targetUrl, "--no-autoupdate"];

const protocol = process.env.TUNNEL_PROTOCOL || "http2";
if (protocol) {
  args.push("--protocol", protocol);
}

const edgeIPVersion = process.env.TUNNEL_EDGE_IP_VERSION || "auto";
if (edgeIPVersion) {
  args.push("--edge-ip-version", edgeIPVersion);
}

if (process.env.TUNNEL_HOSTNAME) {
  args.push("--hostname", process.env.TUNNEL_HOSTNAME);
}

console.log(`[tunel] Iniciando cloudflared apontando para ${targetUrl}...`);
if (process.env.TUNNEL_HOSTNAME) {
  console.log(`[tunel] Hostname fixo: ${process.env.TUNNEL_HOSTNAME}`);
}
if (protocol) {
  console.log(`[tunel] Protocolo preferido: ${protocol}`);
}
if (edgeIPVersion) {
  console.log(`[tunel] Edge IP version: ${edgeIPVersion}`);
}

const tunnel = spawn(binaryPath, args, { stdio: "inherit" });

tunnel.on("exit", (code, signal) => {
  if (signal) {
    console.log(`[tunel] Processo encerrado via sinal ${signal}`);
  } else {
    console.log(`[tunel] Processo finalizado com codigo ${code ?? 0}`);
  }
});
