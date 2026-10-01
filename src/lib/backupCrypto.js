// Optional passphrase encryption for backups. Empty passphrase keeps the old JSON file.
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function keyFromPassphrase(passphrase, salt) {
  const base = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function sealBackup(data, passphrase) {
  if (!passphrase) return data;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFromPassphrase(passphrase, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(data)));
  return {
    app: "safetube_kids",
    sealed: true,
    v: 1,
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(cipher))),
  };
}

export async function openBackup(file, passphrase) {
  if (!file || !file.sealed) return file;
  if (!passphrase) throw new Error("This backup needs its passphrase.");
  const salt = Uint8Array.from(atob(file.salt), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(file.iv), (c) => c.charCodeAt(0));
  const bytes = Uint8Array.from(atob(file.data), (c) => c.charCodeAt(0));
  const key = await keyFromPassphrase(passphrase, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, bytes);
  return JSON.parse(decoder.decode(plain));
}
