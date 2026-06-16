import crypto from "crypto";

/**
 * Cifrado/descifrado de tokens con AES-256-GCM.
 * La clave (TOKEN_ENCRYPTION_KEY) son 32 bytes en hex (64 caracteres).
 *
 * Formato del texto cifrado:  iv:authTag:datos  (todo en hex)
 */

const KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY ?? "", "hex");

if (KEY.length !== 32) {
  // Aviso temprano si la clave está mal (no debería pasar en runtime real).
  console.warn(
    "⚠️ TOKEN_ENCRYPTION_KEY debe ser 64 caracteres hex (32 bytes). Actual: " +
      KEY.length
  );
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
