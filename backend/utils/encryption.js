const crypto = require("crypto");

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const ENCRYPTED_VALUE_PATTERN = /^[0-9a-f]{32}:[0-9a-f]+$/i;

const getKey = () => {
  const secret = process.env.AADHAAR_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error("AADHAAR_ENCRYPTION_KEY is not configured");
  }

  return crypto.createHash("sha256").update(secret).digest();
};

const encrypt = (plainText) => {
  if (plainText === undefined || plainText === null) {
    throw new Error("Value is required for encryption");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decrypt = (encryptedText) => {
  if (!isEncryptedValue(encryptedText)) {
    return encryptedText;
  }

  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
};

const isEncryptedValue = (value) => ENCRYPTED_VALUE_PATTERN.test(String(value || ""));

module.exports = {
  encrypt,
  decrypt,
  isEncryptedValue
};
