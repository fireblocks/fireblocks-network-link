import { createHmac, createPrivateKey, createPublicKey, createSign, createVerify } from "crypto";

export class InvalidSignatureError extends Error {
    public get responseObject() {
        return {
            errorCode: "invalid-signature",
        }
    }
}
export class AlgorithmNotSupportedError extends Error {}

type HashingAlgorithm = "sha256" | "sha512" | "sha3-256"
type SigningAlgorithm = "hmac" | "rsa" | "ecdsa"
type NamedCurve = "prime256v1" | "secp256k1"
type Options = { algorithm: HashingAlgorithm, curve?: NamedCurve }

export abstract class Signer {
    public abstract sign(payload: string, key: string, options: Options): string;
    public abstract verify(payload: string, key: string, signature: string, options: Options): void;
}

export class HMAC implements Signer {

    public sign(data: string, key: string, options: Options): string {
        return createHmac(options.algorithm, key).update(data).digest().toString("binary");
    }

    public verify(data: string, key: string, recv_signature: string, options: Options): void {
        const signature = this.sign(data, key, options);
        if (signature !== recv_signature) {
            throw new InvalidSignatureError();
        }
    }
}

export class RSA implements Signer {
    public sign(data: string, privateKey: string, options: Options): string {
        const priv = createPrivateKey({ key: pemToDer(privateKey), format: "der", type: "pkcs1"})
        const sign = createSign(`rsa-${options.algorithm}`);
        sign.update(data);
        const sigBuffer = sign.sign(priv);
        return sigBuffer.toString("binary");
    }

    public verify(data: string, publicKey: string, signature: string, options: Options): void {
        const pub = createPublicKey({ key: pemToDer(publicKey), format: "der", type: "spki" })
        const verify = createVerify(`rsa-${options.algorithm}`);
        verify.update(data);
        const isValid = verify.verify(pub, Buffer.from(signature, "binary"));
        if (!isValid) {
            throw new InvalidSignatureError();
        }
    }
}

export class ECDSA implements Signer {

    private validateOptions(options: Options) {
        if (options.algorithm !== "sha256") {
            throw new AlgorithmNotSupportedError();
        }
        if (!options.curve || !["prime256v1", "secp256k1"].includes(options.curve)) {
            throw new AlgorithmNotSupportedError();
        }
    }

    public sign(data: string, privateKey: string, options: Options): string {
        this.validateOptions(options);
        const priv = createPrivateKey({ key: pemToDer(privateKey), format: "der", type: "sec1"})
        const sign = createSign("sha256");
        sign.update(data);
        const sigBuffer = sign.sign(priv);
        return sigBuffer.toString("binary");
    }

    public verify(data: string, publicKey: string, signature: string, options: Options): void {
        this.validateOptions(options);
        const pub = createPublicKey({ key: pemToDer(publicKey), format: "der", type: "spki" })
        const verify = createVerify("sha256");
        verify.update(data);
        const isValid = verify.verify(pub, Buffer.from(signature, "binary"));
        if (!isValid) {
            throw new InvalidSignatureError();
        }
    }
}

export function signerFactory(algorithm: SigningAlgorithm): Signer {
    switch(algorithm) {
        case "hmac":
            return new HMAC();
        case "rsa":
            return new RSA();
        case "ecdsa":
            return new ECDSA();
    }
}

function pemToDer(key: string): Buffer {
    const keyLines = key.split('\n');
    const keyLinesWithNoHeaders = keyLines.filter(line => !line.startsWith("-----"))
    
    const cleanedPrivateKey = keyLinesWithNoHeaders.join('').replace(/\n|\r/g, '');

    return Buffer.from(cleanedPrivateKey, "base64");
}

export function getVerifyKey(privateKey: string, algorithm: SigningAlgorithm) {
    switch(algorithm) {
        case "hmac":
            return privateKey;
        case "rsa":
            return generateRSAPublicKey(privateKey);
        case "ecdsa":
            return generateECDSAPublicKey(privateKey);
    }
}

function generateRSAPublicKey(privateKey: string): string {
    const priv = createPrivateKey({ key: pemToDer(privateKey), format: "der", type: "pkcs1"});
    const pub = createPublicKey(priv).export({ type: "spki", format: "pem" }).toString();
    return pub;
}

function generateECDSAPublicKey(privateKey: string): string {
    const priv = createPrivateKey({ key: pemToDer(privateKey), format: "der", type: "sec1"});
    const pub = createPublicKey(priv).export({ type: "spki", format: "pem" }).toString();
    return pub
}