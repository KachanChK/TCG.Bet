import test from "node:test";
import assert from "node:assert/strict";
import { PasswordHasher } from "../src/domain/security/PasswordHasher";

test("PasswordHasher stores a password as a non-plain hash", () => {
    const password = "senha-forte-123";

    const hash = PasswordHasher.hash(password);

    assert.notEqual(hash, password);
    assert.equal(hash.startsWith("scrypt$"), true);
    assert.equal(PasswordHasher.verify(password, hash), true);
});

test("PasswordHasher rejects invalid passwords", () => {
    const hash = PasswordHasher.hash("senha-forte-123");

    assert.equal(PasswordHasher.verify("senha-errada", hash), false);
});

test("PasswordHasher keeps compatibility with legacy plain text passwords", () => {
    assert.equal(PasswordHasher.verify("senha-antiga", "senha-antiga"), true);
    assert.equal(PasswordHasher.verify("outra-senha", "senha-antiga"), false);
});
