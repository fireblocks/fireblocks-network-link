import { Base32, Base58, Base64, HexStr, Plain } from "../src/encoding";

describe("Encoding methods", () => {
    const data = "All in the golden afternoon Full leisurely we glide";
    const base64Encoded = "QWxsIGluIHRoZSBnb2xkZW4gYWZ0ZXJub29uIEZ1bGwgbGVpc3VyZWx5IHdlIGdsaWRl";
    const hexEncoded = "416c6c20696e2074686520676f6c64656e2061667465726e6f6f6e2046756c6c206c6569737572656c7920776520676c696465";
    const base32Encoded = "IFWGYIDJNYQHI2DFEBTW63DEMVXCAYLGORSXE3TPN5XCARTVNRWCA3DFNFZXK4TFNR4SA53FEBTWY2LEMU======";
    const base58Encoded = "4ZMy2teLGsR5CW9yw1h1pBaJuc3wEPNJZ7h2t9vnJimLJjUhvwSc3FPFQXyJ2p1BTLXdMn";

    describe("Plain", () => {
        const encoder = new Plain();
        const encoded = encoder.encode(data);
        it("Encoded payload should match the input", () => {
            expect(encoded).toBe(data);
        })

        it("Decoded payload should match the original input", () => {
            const decoded = encoder.decode(encoded);
            expect(decoded).toBe(data)
        })
    });

    describe("Base64", () => {
        const encoder = new Base64();
        const encoded = encoder.encode(data);
        it("Encoded payload should match encoded example", () => {
            expect(encoded).toBe(base64Encoded);
        })

        it("Decoded payload should match the original input", () => {
            const decoded = encoder.decode(encoded);
            expect(decoded).toBe(data)
        })
    });

    describe("HexStr", () => {
        const encoder = new HexStr();
        const encoded = encoder.encode(data);
        it("Encoded payload should match encoded example", () => {
            expect(encoded).toBe(hexEncoded);
        })

        it("Decoded payload should match the original input", () => {
            const decoded = encoder.decode(encoded);
            expect(decoded).toBe(data)
        })
    });

    describe("Base32", () => {
        const encoder = new Base32();
        const encoded = encoder.encode(data);
        it("Encoded payload should match encoded example", () => {
            expect(encoded).toBe(base32Encoded);
        })

        it("Decoded payload should match the original input", () => {
            const decoded = encoder.decode(encoded);
            expect(decoded).toBe(data)
        })
    });

    describe("Base58", () => {
        const encoder = new Base58();
        const encoded = encoder.encode(data);
        it("Encoded payload should match encoded example", () => {
            expect(encoded).toBe(base58Encoded);
        })

        it("Decoded payload should match the original input", () => {
            const decoded = encoder.decode(encoded);
            expect(decoded).toBe(data)
        })
    });
});