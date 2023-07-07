import { AuthProvider, HTTPMethod } from "../src/auth-provider"
import config from "../src/config";
import { HashingAlgorithm, SigningAlgorithm, signerFactory } from "../src/signing";


describe("Client request authentication", () => {
    describe("Headers enrichment", () => {
        const authConfig = config.get("auth");
        const request = {
            method: "GET",
            endpoint: "/capabilities",
            body: "",
            timestamp: 123,
            nonce: "123"
        }
        const securityHeaders = AuthProvider.getInstance().getSecurityHeaders(request.method as HTTPMethod, request.endpoint, request.body, request.timestamp, request.nonce);
        
        it("Should set all required headers", () => {
            expect(securityHeaders["X-FBAPI-KEY"]).toBeDefined();
            expect(securityHeaders["X-FBAPI-SIGNATURE"]).toBeDefined();
            expect(securityHeaders["X-FBAPI-TIMESTAMP"]).toBeDefined();
            expect(securityHeaders["X-FBAPI-NONCE"]).toBeDefined();
        });

        it("Should set X-FBAPI-KEY from config", () => {
            expect(securityHeaders["X-FBAPI-KEY"]).toEqual(authConfig.apiKey);
        });

        it("Signature should be valid", () => {
            const signature = decodeURIComponent(securityHeaders["X-FBAPI-SIGNATURE"]);
            AuthProvider.getInstance().verifySignature(request.method as HTTPMethod, request.endpoint, request.body, request.timestamp, request.nonce, signature, authConfig.signing.publicKey);
        })
    });
})