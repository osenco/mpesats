"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const axios_1 = __importDefault(require("axios"));
const constants = __importStar(require("constants"));
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Service {
    /**
     * Setup global configuration for classes
     * @param Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs) {
        /**
         * @param object config Configuration options
         */
        this.config = {
            env: "sandbox",
            type: 4,
            shortcode: 174379,
            store: 174379,
            key: "9v38Dtu5u2BpsITPmLcXNWGMsjZRWSTG",
            secret: "bclwIPkcRqw61yUt",
            username: "apitest",
            password: "",
            passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
            validationUrl: "/lipwa/validate",
            confirmationUrl: "/lipwa/confirm",
            callbackUrl: "/lipwa/reconcile",
            timeoutUrl: "/lipwa/timeout",
            resultUrl: "/lipwa/results",
            billingUrl: "/lipwa/billing",
        };
        this.config = configs;
        this.http = axios_1.default.create({
            baseURL: this.config.env === "live"
                ? "https://api.safaricom.co.ke"
                : "https://sandbox.safaricom.co.ke",
            withCredentials: true,
        });
        this.http.defaults.headers.common = {
            Accept: "application/json",
            "Content-Type": "application/json",
        };
    }
    /**
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */
    authenticate(token = null) {
        if (!this.token && token) {
            this.token = token;
        }
        else {
            try {
                this.get("oauth/v1/generate?grant_type=client_credentials").then(({ data }) => {
                    this.token = data === null || data === void 0 ? void 0 : data.access_token;
                });
            }
            catch (error) {
                return error;
            }
        }
        return this;
    }
    async generateSecurityCredential() {
        return crypto
            .publicEncrypt({
            key: fs.readFileSync(path.join(__dirname, "certs", this.config.env, "cert.cer"), "utf8"),
            padding: constants.RSA_PKCS1_PADDING,
        }, Buffer.from(this.config.password))
            .toString("base64");
    }
    /**
     * Perform a GET request to the M-PESA Daraja API
     * @param endpoint Daraja API URL Endpoint
     * @param credentials Formated Auth credentials
     *
     * @return string/bool
     */
    async get(endpoint) {
        const auth = "Basic " +
            Buffer.from(`${this.config.key}:${this.config.secret}`).toString("base64");
        return await this.http.get(endpoint, {
            headers: {
                Authorization: auth,
            },
        });
    }
    /**
     * Perform a POST request to the M-PESA Daraja API
     * @param endpoint Daraja API URL Endpoint
     * @param Array data Formated array of data to send
     *
     * @return string/bool
     */
    async post(endpoint, payload) {
        return this.http
            .post(endpoint, payload, {
            headers: {
                Authorization: "Bearer " + this.token,
            },
        })
            .then(({ data }) => data)
            .catch((e) => {
            if (e.response.data) {
                return e.response.data;
            }
            else {
                return { errorCode: 500, errorMessage: e.message };
            }
        });
    }
}
exports.Service = Service;
//# sourceMappingURL=service.js.map