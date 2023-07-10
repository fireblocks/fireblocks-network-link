import { KeyObject, createPrivateKey, createPublicKey, randomUUID } from "crypto"
import config from "./config";
import { signerFactory } from "./signing";
import { encoderFactory } from "./encoding";

export interface AuthHeaders {
    "X-FBAPI-KEY": string,
    "X-FBAPI-SIGNATURE": string,
    "X-FBAPI-TIMESTAMP": string,
    "X-FBAPI-NONCE": string;
}

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export class MissingAuthHeaders extends Error {
    constructor(private missingHeader: "key" | "nonce" | "timestamp" | "signature") {
        super();
    }

    public get responseObject() {
        return {
            errorCode: this.getErrorCode(),
        }
    }

    private getErrorCode() {
        return `missing-${this.missingHeader}-header`;
    }
};


const authConfig = config.get('authentication');


export function getAuthHeaders(method: HTTPMethod, endpoint: string, body: any, timestamp?: number, nonce?: string): AuthHeaders {
    if (!nonce) {
        nonce = randomUUID();
    }
    if (!timestamp) {
        timestamp = Date.now();
    }
    const signature = getRequestSignature(method, endpoint, body, timestamp, nonce);

    return {
        "X-FBAPI-KEY": authConfig.apiKey,
        "X-FBAPI-SIGNATURE": encodeURIComponent(signature),
        "X-FBAPI-TIMESTAMP": timestamp.toString(),
        "X-FBAPI-NONCE": nonce
    }
}

export function verifySignature(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string, signature: string): void {
    const decodedSignature = decodeSignature(decodeURIComponent(signature));
    const prehashString = createPrehashString(method, endpoint, body, timestamp, nonce);
    const encodedPrehashString = encodePrehashString(prehashString);
    verify(encodedPrehashString, decodedSignature);
}
    
function createPrehashString(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string): string {
    return `${timestamp}${nonce}${method}${endpoint}${stringifyBody(body)}`;
}

function getRequestSignature(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string): string {
    const prehashString = createPrehashString(method, endpoint, body, timestamp, nonce);
    const encodedPrehashString = encodePrehashString(prehashString);
    const signature = sign(encodedPrehashString);
    const encodedSignature = encodeSignature(signature);
    return encodedSignature;
}

function sign(payload: string): string {
    return signerFactory(authConfig.signing.signingAlgorithm).sign(payload, getSignKey(), authConfig.signing.hashAlgorithm);
}

function verify(payload: string, decodedSignature: string): void {
    signerFactory(authConfig.signing.signingAlgorithm).verify(payload, getVerifyKey(), decodedSignature, authConfig.signing.hashAlgorithm);
}

function encodePrehashString(prehashString: string): string {
    return encoderFactory(authConfig.signing.preEncoding).encode(prehashString);
}

function encodeSignature(signature: string): string {
    return encoderFactory(authConfig.signing.postEncoding).encode(signature);
}

function decodeSignature(encodedSignature: string): string {
    return encoderFactory(authConfig.signing.postEncoding).decode(encodedSignature);
}

function getSignKey(): KeyObject | string {
    if (authConfig.signing.signingAlgorithm === "hmac") {
        return authConfig.signing.privateKey;
    }

    return createPrivateKey(authConfig.signing.privateKey);
}

function getVerifyKey(): KeyObject | string {
    if (authConfig.signing.signingAlgorithm === "hmac") {
        return authConfig.signing.privateKey;
    }

    return createPublicKey(getSignKey());
}

function stringifyBody(body: any): string {
    if (!body) {
        return "";
    }
    return JSON.stringify(body);
}
