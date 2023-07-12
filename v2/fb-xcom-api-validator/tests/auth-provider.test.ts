import { HTTPMethod, createSecurityHeaders, verifySignature } from "../src/auth-provider"
import { ApiRequestOptions } from "../src/client/generated/core/ApiRequestOptions";
import config from "../src/config";


describe("Client request authentication", () => {
    describe("Request headers", () => {
        const authConfig = config.get("authentication");
        const request = {
            method: "GET",
            url: "/capabilities",
            body: "",
        }
        const securityHeaders = createSecurityHeaders(request as ApiRequestOptions);
        
        it("Should set all required headers", () => {
            expect(securityHeaders.xFbapiKey).toBeDefined();
            expect(securityHeaders.xFbapiNonce).toBeDefined();
            expect(securityHeaders.xFbapiSignature).toBeDefined();
            expect(securityHeaders.xFbapiTimestamp).toBeDefined();
        });

        it("Should set X-FBAPI-KEY from config", () => {
            expect(securityHeaders.xFbapiKey).toEqual(authConfig.apiKey);
        });

        it("Signature should be valid", () => {
            verifySignature(request.method as HTTPMethod, request.url, request.body, securityHeaders.xFbapiTimestamp, securityHeaders.xFbapiNonce, securityHeaders.xFbapiSignature);
        })
    });
})