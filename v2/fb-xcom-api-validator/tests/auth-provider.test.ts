import { HTTPMethod, createSecurityHeaders, verifySignature } from "../src/security/auth-provider"
import { ApiRequestOptions } from "../src/client/generated/core/ApiRequestOptions";
import config from "../src/config";
import { SecurityHeaders } from "../src/client/SecureClient";


describe("Client request authentication", () => {
    describe("Request headers", () => {
        let securityHeaders: SecurityHeaders;
        let authConfig;
        const request = {
            method: "GET",
            url: "/capabilities",
            body: "",
        }
        
        beforeAll(() => {
            authConfig = config.get("authentication");
            securityHeaders = createSecurityHeaders(request as ApiRequestOptions);
        });
        
        it("should set all required headers", () => {
            expect(securityHeaders.xFbapiKey).toBeDefined();
            expect(securityHeaders.xFbapiNonce).toBeDefined();
            expect(securityHeaders.xFbapiSignature).toBeDefined();
            expect(securityHeaders.xFbapiTimestamp).toBeDefined();
        });

        it("should set X-FBAPI-KEY from config", () => {
            expect(securityHeaders.xFbapiKey).toEqual(authConfig.apiKey);
        });

        describe("Signature", () => {
            it("should be valid", () => {
                verifySignature(request.method as HTTPMethod, request.url, request.body, securityHeaders.xFbapiTimestamp, securityHeaders.xFbapiNonce, securityHeaders.xFbapiSignature);
            })
        })
    });
})