import { describe, it, expect } from 'vitest';
import { deriveKey, encrypt, decrypt } from './utils';

describe('crypto utils', () => {
  it('encrypts and decrypts round-trip', async () => {
    const master = 'SuperSecret123!';
    const { key, salt } = await deriveKey(master);

    const secret = 'hello world';
    const cipher = await encrypt(secret, key);

    const plain = await decrypt(cipher, key);
    expect(plain).toBe(secret);

    // derive again with same salt should decrypt too
    const { key: key2 } = await deriveKey(master, salt);
    const plain2 = await decrypt(cipher, key2);
    expect(plain2).toBe(secret);
  });
}); 