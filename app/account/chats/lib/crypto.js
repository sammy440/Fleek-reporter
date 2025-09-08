// /lib/crypto.js
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
  return u8;
}

/* ---------- Identity keys ---------- */
export async function generateIdentityKeyPair() {
  const kp = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicJwk = await crypto.subtle.exportKey("jwk", kp.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", kp.privateKey);

  return { publicJwk, privateJwk };
}

/* ---------- import helpers ---------- */
export async function importPublicJwk(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
}

export async function importPrivateJwk(jwk) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

/* ---------- derive conversation AES key via ECDH + HKDF ---------- */
export async function deriveConversationKey(
  myPrivateJwk,
  peerPublicJwk,
  saltBase64
) {
  const myPriv = await importPrivateJwk(myPrivateJwk);
  const peerPub = await importPublicJwk(peerPublicJwk);

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: peerPub },
    myPriv,
    256
  );

  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedBits,
    "HKDF",
    false,
    ["deriveKey"]
  );

  const salt = saltBase64
    ? base64ToUint8Array(saltBase64)
    : crypto.getRandomValues(new Uint8Array(16));

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: encoder.encode("fleek-reporter:conversation:v1"),
    },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  return { aesKey, saltBase64: bufToBase64(salt) };
}

/* ---------- AES-GCM encrypt/decrypt ---------- */
export async function encryptWithAesGcm(aesKey, plaintext) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoder.encode(plaintext)
  );
  return { ivBase64: bufToBase64(iv), ciphertextBase64: bufToBase64(ct) };
}

export async function decryptWithAesGcm(aesKey, ivBase64, ciphertextBase64) {
  const iv = base64ToUint8Array(ivBase64);
  const ct = base64ToUint8Array(ciphertextBase64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, ct);
  return decoder.decode(pt);
}
