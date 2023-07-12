import { randomUUID } from "crypto"
import config from "../config";
import { HashAlgorithm, SigningAlgorithm, getVerifyKey, signerFactory } from "./signing";
import { Encoding, encoderFactory } from "./encoding";
import { SecurityHeaders } from "../client/SecureClient";
import { ApiRequestOptions } from "../client/generated/core/ApiRequestOptions";

export type HTTPMethod = 'GET' | 'PUT' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';


export function createSecurityHeaders({ method, url, body }: ApiRequestOptions): SecurityHeaders {
    const authConfig = config.get('authentication');
    const nonce = randomUUID();
    const timestamp = Date.now();
    const signature = getRequestSignature(method, url, body, timestamp, nonce, authConfig.signing);

    return {
        xFbapiKey: authConfig.apiKey,
        xFbapiSignature: encodeURIComponent(signature),
        xFbapiTimestamp: timestamp,
        xFbapiNonce: nonce
    }
}

export function verifySignature(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string, signature: string): void {
    const signingConfig = config.get('authentication').signing;
    const decodedSignature = decode(decodeURIComponent(signature), signingConfig.postEncoding);
    const prehashString = createPrehashString(method, endpoint, body, timestamp, nonce);
    const encodedPrehashString = encode(prehashString, signingConfig.preEncoding);
    verify(encodedPrehashString, decodedSignature, signingConfig.signingAlgorithm, signingConfig.privateKey, signingConfig.hashAlgorithm);
}
    
function createPrehashString(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string): string {
    return `${timestamp}${nonce}${method}${endpoint}${stringifyBody(body)}`;
}

function getRequestSignature(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string, signingConfig: any): string {
    const prehashString = createPrehashString(method, endpoint, body, timestamp, nonce);
    const encodedPrehashString = encode(prehashString, signingConfig.preEncoding);
    const signature = sign(encodedPrehashString, signingConfig.signingAlgorithm, signingConfig.privateKey, signingConfig.hashAlgorithm);
    const encodedSignature = encode(signature, signingConfig.postEncoding);
    return encodedSignature;
}

function sign(payload: string, signingAlgorithm: SigningAlgorithm, privateKey: string, hashAlgorithm: HashAlgorithm): string {
    return signerFactory(signingAlgorithm).sign(payload, privateKey, hashAlgorithm);
}

function verify(payload: string, decodedSignature: string, signingAlgorithm: SigningAlgorithm, privateKey: string, hashAlgorithm: HashAlgorithm): void {
    signerFactory(signingAlgorithm).verify(payload, getVerifyKey(privateKey, signingAlgorithm), decodedSignature, hashAlgorithm);
}

function encode(payload: string, encoding: Encoding): string {
    return encoderFactory(encoding).encode(payload);
}

function decode(payload: string, encoding: Encoding): string {
    return encoderFactory(encoding).decode(payload);
}

function stringifyBody(body: any): string {
    if (!body) {
        return "";
    }
    return JSON.stringify(body);
}
