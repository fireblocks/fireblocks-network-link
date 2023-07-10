import { KeyObject, createHmac, createSign, createVerify } from "crypto"

export class InvalidSignatureError extends Error {
    public get responseObject() {
        return {
            errorCode: "invalid-signature",
        }
    }
}
export class AlgorithmNotSupportedError extends Error {}

export type HashingAlgorithm = "sha256" | "sha512" | "sha3-256"
export type SigningAlgorithm = "hmac" | "rsa" | "ecda"

export abstract class Signer {
    public abstract sign(payload: string, key: string | KeyObject, algorithm: HashingAlgorithm): string;
    public abstract verify(payload: string, key: string | KeyObject, signature: string, algorithm: HashingAlgorithm): void;
}

export class HMAC implements Signer {

    public sign(data: string, key: string, algorithm: HashingAlgorithm): string {
        return createHmac(algorithm, key).update(data).digest().toString("binary");
    }

    public verify(data: string, key: string, recv_signature: string, algorithm: HashingAlgorithm): void {
        const signature = this.sign(data, key, algorithm);
        if (signature !== recv_signature) {
            throw new InvalidSignatureError();
        }
    }
}

export class RSA implements Signer {

    public sign(data: string, privateKey: string | KeyObject, algorithm: HashingAlgorithm): string {
        const sign = createSign(`rsa-${algorithm}`);
        sign.update(data);
        return sign.sign(privateKey).toString("binary");
    }

    public verify(data: string, publicKey: string | KeyObject, signature: string, algorithm: HashingAlgorithm): void {
        const verify = createVerify(`rsa-${algorithm}`);
        verify.update(data);
        const verified = verify.verify(publicKey, Buffer.from(signature, "binary"));
        if (!verified) {
            throw new InvalidSignatureError();
        }
    }
}

export class ECDSA implements Signer {

    private validateAlgorithm(algorithm: HashingAlgorithm) {
        if (algorithm !== "sha256") {
            throw new AlgorithmNotSupportedError();
        }
    }
    // need to investigate how to set the type of elliptic curve in sign and verify
    public sign(data: string, privateKey: string | KeyObject, algorithm: HashingAlgorithm) {
        this.validateAlgorithm(algorithm);
        const sign = createSign("sha256");
        sign.update(data);
        return sign.sign(privateKey).toString("binary")
    }

    public verify(data: string, publicKey: string | KeyObject, signature: string, algorithm: HashingAlgorithm) {
        this.validateAlgorithm(algorithm);
        const verify = createVerify("sha256");
        verify.update(data)
        const verified = verify.verify(publicKey, Buffer.from(signature, "binary"));
        if (!verified) {
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
        case "ecda":
            return new ECDSA();
    }
}