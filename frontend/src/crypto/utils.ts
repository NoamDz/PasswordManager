/* Client-side cryptography helpers
 * – deriveKey: PBKDF2-SHA256 with configurable iterations & salt (default 100k)
 * – encrypt: AES-GCM 256-bit, random 12-byte IV, returns base64 strings
 * – decrypt: reverse operation
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface DerivedKey {
  key: CryptoKey;
  salt: string; // base64
  iterations: number;
}

function bufToBase64(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function deriveKey(password: string, saltB64?: string, iterations = 100_000): Promise<DerivedKey> {
  const salt = saltB64 ? base64ToBuf(saltB64) : crypto.getRandomValues(new Uint8Array(16)).buffer;
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  return { key, salt: bufToBase64(salt), iterations };
}

export interface CipherText {
  iv: string; // base64
  data: string; // base64
}

export async function encrypt(data: string, key: CryptoKey): Promise<CipherText> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data),
  );
  return { iv: bufToBase64(iv.buffer), data: bufToBase64(cipher) };
}

export async function decrypt(cipher: CipherText, key: CryptoKey): Promise<string> {
  const iv = base64ToBuf(cipher.iv);
  const encData = base64ToBuf(cipher.data);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    encData,
  );
  return decoder.decode(plainBuf);
} 