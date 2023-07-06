import baseX from "base-x";

export class UnsupportedEncodingFormatError extends Error {}

export type Encoding = "plain" | "base64" | "hexstr" | "base32" | "base58";

export abstract class Encoder {
    public abstract encode(payload: string): string;
    public abstract decode(payload: string): string;
}

export class Plain implements Encoder {
    public encode(payload: string) { return payload };
    public decode(payload: string) { return payload };
}

export class Base64 implements Encoder {
    public encode(payload: string) {
        return Buffer.from(payload).toString("base64");
    }
    public decode(payload: string): string {
        return Buffer.from(payload, "base64").toString();
    }
}

export class HexStr implements Encoder {
    public encode(payload: string): string {
        return Buffer.from(payload).toString("hex");
    }
    public decode(payload: string): string {
        return Buffer.from(payload, "hex").toString();    
    }
}

export class Base32 implements Encoder {
    // RFC 4648
    private alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private base32 = baseX(this.alphabet);

    public encode(payload: string): string {
        return this.base32.encode(new TextEncoder().encode(payload));
    }
    public decode(payload: string): string {
        return new TextDecoder().decode(this.base32.decode(payload));
    }
}

export class Base58 implements Encoder {
    private alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    private base58 = baseX(this.alphabet);

    public encode(payload: string): string {
        return this.base58.encode(new TextEncoder().encode(payload));
    }
    public decode(payload: string): string {
        return new TextDecoder().decode(this.base58.decode(payload));
    }
}

export const encoderFactory = (encoding: Encoding) => {
    switch (encoding) {
        case "plain":
            return new Plain();
        case "base32":
            return new Base32();
        case "base58":
            return new Base58();
        case "base64":
            return new Base64();
        case "hexstr":
            return new HexStr();
        default:
            throw new UnsupportedEncodingFormatError();
    }
}