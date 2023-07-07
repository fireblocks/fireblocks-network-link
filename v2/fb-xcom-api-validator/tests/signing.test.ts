import { generateKeyPairSync } from "crypto";
import { AlgorithmNotSupportedError, ECDSA, HMAC, RSA } from "../src/signing"

describe("Signing methods", () => {
    const data = "data";
    const secret = "secret";
    const { privateKey: rsaPrivateKey, publicKey: rsaPublicKey } = generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs1",
            format: "pem"
        }
    });
    const { privateKey: ecdsaPrivateKey, publicKey: ecdsaPublicKey } = generateKeyPairSync('ec', { namedCurve: 'secp256k1' });

    describe("HMAC", () => {
        const signer = new HMAC();
        describe("SHA256", () => {
            it("Should sign and verify successfully", () => {
                const signature = signer.sign(data, secret, "sha256");
                signer.verify(data, secret, signature, "sha256");
            });
        });
        describe("SHA512", () => {
            it("Should sign and verify successfully", () => {
                const signature = signer.sign(data, secret, "sha512");
                signer.verify(data, secret, signature, "sha512");
            });
        });
        describe("SHA3-256", () => {
            it("Should sign and verify successfully", () => {
                const signature = signer.sign(data, secret, "sha3-256");
                signer.verify(data, secret, signature, "sha3-256");
            });
        });
    });

    describe("RSA", () => {
        const signer = new RSA();
        describe("SHA256", () => {
            it("Should sign and verify successfully", () => {
                const signature = signer.sign(data, rsaPrivateKey, "sha256");
                signer.verify(data, rsaPublicKey, signature, "sha256");
            });
        });
        describe("SHA512", () => {
            it("Should sign and verify successfully", () => {
                const signature = signer.sign(data, rsaPrivateKey, "sha512");
                signer.verify(data, rsaPublicKey, signature, "sha512");
            });
        });
        describe("SHA3-256", () => {
            it("Should sign and verify successfully", () => {
                const signature = signer.sign(data, rsaPrivateKey, "sha3-256");
                signer.verify(data, rsaPublicKey, signature, "sha3-256");
            });
        });
    });

    describe("ECDSA", () => {
        const signer = new ECDSA();
        describe("SHA256", () => {
            it("Should sign and verify successfully", () => {
                const signature = signer.sign(data, ecdsaPrivateKey, "sha256");
                signer.verify(data, ecdsaPublicKey, signature, "sha256");
            })
        })
        describe("SHA512", () => {
            it("Should throw unsupported algorithm", () => {
                expect(() => { signer.sign(data, ecdsaPrivateKey, "sha512") }).toThrow(AlgorithmNotSupportedError)
            });
        })
        describe("SHA3-256", () => {
            it("Should throw unsupported algorithm", () => {
                expect(() => { signer.sign(data, ecdsaPrivateKey, "sha3-256") }).toThrow(AlgorithmNotSupportedError)
            })
        })
    })
});