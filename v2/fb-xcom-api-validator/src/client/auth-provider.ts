import { randomUUID } from "crypto"
import config from "../config";
import { signerFactory } from "../signing";
import { encoderFactory } from "../encoding";

export interface AuthHeaders {
    "X-FBAPI-KEY": string,
    "X-FBAPI-SIGNATURE": string,
    "X-FBAPI-TIMESTAMP": string,
    "X-FBAPI-NONCE": string;
}

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";

export class AuthProvider {
    private static instance: AuthProvider;
    private config;

    private constructor() {
        this.config = config.get('auth');
    }

    public static getInstance(): AuthProvider {
        if (!AuthProvider.instance) {
            AuthProvider.instance = new AuthProvider();
        }
        return AuthProvider.instance;
    }

    public getSecurityHeaders(method: HTTPMethod, endpoint: string, body: any, timestamp?: number, nonce?: string): AuthHeaders {
        if (!nonce) {
            nonce = randomUUID();
        }
        if (!timestamp) {
            timestamp = Date.now();
        }
        const signature = this.getSignature(method, endpoint, body, timestamp, nonce);
    
        return {
            "X-FBAPI-KEY": this.config.apiKey,
            "X-FBAPI-SIGNATURE": signature,
            "X-FBAPI-TIMESTAMP": timestamp.toString(),
            "X-FBAPI-NONCE": nonce
        }
    }
    
    public static createPrehashString(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string): string {
        return `${timestamp}${nonce}${method}${endpoint}${this.stringifyBody(body)}`;;
    }

    private getSignature(method: HTTPMethod, endpoint: string, body: any, timestamp: number, nonce: string): string {
        const prehashString = AuthProvider.createPrehashString(method, endpoint, body, timestamp, nonce);
        const encodedPrehashString = this.encodePrehashString(prehashString);
        const signature = this.sign(encodedPrehashString);
        const encodedSignature = this.encodeSignature(signature);
        return encodedSignature;
    }

    private sign(payload: string): string {
        return signerFactory(this.config.signing.signingAlgorithm).sign(payload, this.config.signing.privateKey, this.config.signing.requestSigningFormat);
    }

    private encodePrehashString(prehashString: string): string {
        return encoderFactory(this.config.signing.requestEncodingFormat).encode(prehashString);
    }

    private encodeSignature(signature: string): string {
        return encoderFactory(this.config.signing.signatureEncodingFormat).encode(signature);
    }

    private static stringifyBody(body: any): string {
        if (!body) {
            return "";
        }
        return JSON.stringify(body);
    }
}
