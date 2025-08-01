// utils/encryption.js - Fixed encryption utilities
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

// Generate a consistent 32-byte key from the environment variable
const generateKey = (secret) => {
  if (!secret) {
    console.warn(
      "⚠️  No ENCRYPTION_KEY provided, using default (not secure for production)"
    );
    secret = "default-encryption-key-change-this-in-production";
  }
  // Create a 32-byte key from the secret using SHA-256
  return crypto.createHash("sha256").update(secret).digest();
};

const ENCRYPTION_KEY = generateKey(process.env.ENCRYPTION_KEY);
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16

const encrypt = (text) => {
  try {
    if (!text || typeof text !== "string") {
      console.warn("Encrypt: Invalid input text");
      return null;
    }

    // Generate a random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher with the IV
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + encrypted text, separated by ':'
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

const decrypt = (encryptedData) => {
  try {
    if (!encryptedData || typeof encryptedData !== "string") {
      console.warn("Decrypt: Invalid input data");
      return null;
    }

    // Split the IV and encrypted text
    const parts = encryptedData.split(":");
    if (parts.length !== 2) {
      console.error("Decrypt: Invalid encrypted data format");
      return null;
    }

    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = parts[1];

    // Validate IV length
    if (iv.length !== IV_LENGTH) {
      console.error("Decrypt: Invalid IV length");
      return null;
    }

    // Create decipher with the IV
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// Test function to verify encryption/decryption works
const testEncryption = () => {
  const testText = "test-token-12345";
  const encrypted = encrypt(testText);
  const decrypted = decrypt(encrypted);

  console.log("🔐 Encryption Test:");
  console.log("Original:", testText);
  console.log("Encrypted:", encrypted);
  console.log("Decrypted:", decrypted);
  console.log("Test passed:", testText === decrypted);

  return testText === decrypted;
};

module.exports = { encrypt, decrypt, testEncryption };
