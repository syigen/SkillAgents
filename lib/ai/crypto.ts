/**
 * lib/ai/crypto.ts
 * AES-256-GCM encryption/decryption for user API keys stored in DB.
 * The secret is read from AI_KEY_ENCRYPTION_SECRET (must be 32 bytes).
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getSecret(): Buffer {
    const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
    if (!secret) {
        throw new Error("AI_KEY_ENCRYPTION_SECRET is not set in environment variables.");
    }
    // Ensure exactly 32 bytes (pad or slice)
    return Buffer.from(secret.padEnd(32, "0").slice(0, 32), "utf8");
}

/**
 * Encrypts a plaintext API key.
 * Returns { enc, iv } where both are hex strings safe to store in DB.
 */
export function encryptKey(plain: string): { enc: string; iv: string } {
    const iv = randomBytes(12); // 96-bit IV for GCM
    const cipher = createCipheriv(ALGORITHM, getSecret(), iv);

    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Store tag appended to ciphertext
    const payload = Buffer.concat([encrypted, tag]);

    return {
        enc: payload.toString("hex"),
        iv: iv.toString("hex"),
    };
}

/**
 * Decrypts an encrypted API key from DB storage.
 */
export function decryptKey(enc: string, iv: string): string {
    const payload = Buffer.from(enc, "hex");
    const ivBuf = Buffer.from(iv, "hex");

    // Last 16 bytes are the auth tag
    const tag = payload.subarray(payload.length - 16);
    const ciphertext = payload.subarray(0, payload.length - 16);

    const decipher = createDecipheriv(ALGORITHM, getSecret(), ivBuf);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
