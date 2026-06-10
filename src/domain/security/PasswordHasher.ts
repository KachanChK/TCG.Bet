import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

export class PasswordHasher {
    static hash(password: string): string {
        if (!password || password.trim().length === 0) {
            throw new Error("Senha invalida.");
        }

        const salt = randomBytes(16).toString("base64url");
        const hash = scryptSync(password, salt, KEY_LENGTH).toString("base64url");

        return `${HASH_PREFIX}$${salt}$${hash}`;
    }

    static verify(password: string, storedPassword: string): boolean {
        if (!storedPassword.startsWith(`${HASH_PREFIX}$`)) {
            return storedPassword === password;
        }

        const [, salt, hash] = storedPassword.split("$");
        if (!salt || !hash) {
            return false;
        }

        const expected = Buffer.from(hash, "base64url");
        const actual = scryptSync(password, salt, expected.length);

        return actual.length === expected.length && timingSafeEqual(actual, expected);
    }
}
