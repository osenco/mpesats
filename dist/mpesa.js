"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.Mpesa = void 0;
const axios_1 = __importDefault(require("axios"));
const constants = __importStar(require("constants"));
const date_fns_1 = require("date-fns");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Mpesa {
    /**
     * Setup global configuration for classes
     * @var Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs) {
        /**
         * @var object config Configuration options
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
        };
        this.ref = Math.random().toString(16).substr(2, 8).toUpperCase();
        const defaults = {
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
        };
        if (!configs || !configs.store) {
            configs.store = configs.shortcode;
        }
        this.config = Object.assign(Object.assign({}, defaults), configs);
        this.http = axios_1.default.create({
            baseURL: this.config.env == "live"
                ? "https://api.safaricom.co.ke"
                : "https://sandbox.safaricom.co.ke",
            withCredentials: true,
        });
        this.http.defaults.headers.common = {
            Accept: "application/json",
            "Content-Type": "application/json"
        };
    }
    /**
     * Perform a GET request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var String credentials Formated Auth credentials
     *
     * @return string/bool
     */
    async get(endpoint) {
        const auth = "Basic " + Buffer.from(this.config.key + ":" + this.config.secret).toString("base64");
        return await this.http.get(endpoint, {
            headers: {
                "Authorization": auth
            }
        });
    }
    /**
     * Perform a POST request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var Array data Formated array of data to send
     *
     * @return string/bool
     */
    async post(endpoint, payload) {
        return this.http.post(endpoint, payload, {
            headers: {
                "Authorization": "Bearer " + await this.authenticate()
            }
        })
            .then(({ data }) => data)
            .catch((e) => {
            return e.response.data;
        });
    }
    /**
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */
    async authenticate() {
        try {
            const { data } = await this.get("oauth/v1/generate?grant_type=client_credentials");
            return data === null || data === void 0 ? void 0 : data.access_token;
        }
        catch (error) {
            return error;
        }
    }
    async generateSecurityCredential() {
        return crypto
            .publicEncrypt({
            key: fs.readFileSync(path.join(__dirname, "certs", this.config.env, "cert.cer"), "utf8"),
            padding: constants.RSA_PKCS1_PADDING
        }, Buffer.from(this.config.password))
            .toString("base64");
    }
    /**
     * @var Integer phone The MSISDN sending the funds.
     * @var Integer amount The amount to be transacted.
     * @var String reference Used with M-Pesa PayBills.
     * @var String description A description of the transaction.
     * @var String remark Remarks
     *
     * @return Promise<any> Response
     */
    async stkPush(phone, amount, reference = this.ref, description = "Transaction Description", remark = "Remark") {
        phone = String(phone);
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;
        const timestamp = date_fns_1.format(new Date(), "yyyyMMddHHmmss");
        const password = Buffer.from(this.config.shortcode + this.config.passkey + timestamp).toString("base64");
        const response = await this.post("mpesa/stkpush/v1/processrequest", {
            BusinessShortCode: this.config.store,
            Password: password,
            Timestamp: timestamp,
            TransactionType: (Number(this.config.type) == 4) ? "CustomerPayBillOnline" : "CustomerBuyGoodsOnline",
            Amount: Number(amount),
            PartyA: phone,
            PartyB: this.config.shortcode,
            PhoneNumber: phone,
            CallBackURL: this.config.callbackUrl,
            AccountReference: reference,
            TransactionDesc: description,
            Remark: remark,
        });
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
    }
    async registerUrls(response_type = "Completed") {
        const response = await this.post("mpesa/c2b/v1/registerurl", {
            "ShortCode": this.config.store,
            "ResponseType": response_type,
            "ConfirmationURL": this.config.confirmationUrl,
            "ValidationURL": this.config.validationUrl,
        });
        if (response.errorCode) {
            return { data: null, error: response };
        }
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
    }
    /**
     * Simulates a C2B request
     *
     * @param Integer phone Receiving party phone
     * @param Integer amount Amount to transfer
     * @param String command Command ID
     * @param String reference
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    async simulate(phone, amount = 10, reference = "TRX", command = "") {
        phone = String(phone);
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;
        const response = await this.post("mpesa/c2b/v1/simulate", {
            ShortCode: this.config.shortcode,
            CommandID: command,
            Amount: Number(amount),
            Msisdn: phone,
            BillRefNumber: reference,
        });
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
    }
    /**
     * Transfer funds between two paybills
     * @param receiver Receiving party phone
     * @param amount Amount to transfer
     * @param command Command ID
     * @param occassion
     * @param remarks
     *
     * @return Promise<any>
     */
    async sendB2C(phone, amount = 10, command = "BusinessPayment", remarks = "", occassion = "") {
        phone = String(phone);
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;
        const response = await this.post("mpesa/b2c/v1/paymentrequest", {
            InitiatorName: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            CommandID: command,
            Amount: Number(amount),
            PartyA: this.config.shortcode,
            PartyB: phone,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeoutUrl,
            ResultURL: this.config.resultUrl,
            Occasion: occassion
        });
        if (response.OriginatorConversationID) {
            return { data: response, error: null };
        }
        if (response.ResultCode && response.ResultCode !== 0) {
            return {
                data: null, error: {
                    errorCode: response.ResultCode,
                    errorMessage: response.ResultDesc
                }
            };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
    }
    /**
  * Transfer funds between two paybills
  * @param receiver Receiving party paybill
  * @param receiver_type Receiver party type
  * @param amount Amount to transfer
  * @param command Command ID
  * @param reference Account Reference mandatory for “BusinessPaybill” CommandID.
  * @param remarks
  *
  * @return Promise<any>
  */
    async sendB2B(receiver, receiver_type, amount, command = "BusinessBuyGoods", reference = "TRX", remarks = "") {
        const response = await this.post("mpesa/b2b/v1/paymentrequest", {
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            CommandID: command,
            SenderIdentifierType: this.config.type,
            RecieverIdentifierType: receiver_type,
            Amount: amount,
            PartyA: this.config.shortcode,
            PartyB: receiver,
            AccountReference: reference,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeoutUrl,
            ResultURL: this.config.resultUrl,
        });
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
    }
    /**
     * Get Status of a Transaction
     *
     * @var String transaction
     * @var String command
     * @var String remarks
     * @var String occassion
     *
     * @return Promise<any> Result
     */
    async checkStatus(transaction, command = "TransactionStatusQuery", remarks = "Transaction Status Query", occasion = "Transaction Status Query") {
        const response = await this.post("mpesa/transactionstatus/v1/query", {
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            CommandID: command,
            TransactionID: transaction,
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
            ResultURL: this.config.resultUrl,
            QueueTimeOutURL: this.config.timeoutUrl,
            Remarks: remarks,
            Occasion: occasion,
        });
        if (response.MerchantRequestID) {
            return { data: response };
        }
        if (response.errorCode) {
            return { error: response };
        }
    }
    /**
     * Reverse a Transaction
     *
     * @var String transaction
     * @var Integer amount
     * @var Integer receiver
     * @var String receiver_type
     * @var String remarks
     * @var String occassion
     *
     * @return Promise<any> Result
     */
    async reverseTransaction(transaction, amount, receiver, receiver_type = 3, remarks = "Transaction Reversal", occasion = "Transaction Reversal") {
        const response = await this.post("mpesa/reversal/v1/request", {
            CommandID: "TransactionReversal",
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            TransactionID: transaction,
            Amount: amount,
            ReceiverParty: receiver,
            RecieverIdentifierType: receiver_type,
            ResultURL: this.config.resultUrl,
            QueueTimeOutURL: this.config.timeoutUrl,
            Remarks: remarks,
            Occasion: occasion
        });
        if (response.MerchantRequestID) {
            return { data: response };
        }
        if (response.errorCode) {
            return { error: response };
        }
    }
    /**
     * Check Account Balance
     *
     * @var String command
     * @var String remarks
     * @var String occassion
     *
     * @return Promise<any> Result
     */
    async checkBalance(command, remarks = "Balance Query") {
        const response = await this.post("mpesa/accountbalance/v1/query", {
            CommandID: command,
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeoutUrl,
            ResultURL: this.config.resultUrl,
        });
        if (response.MerchantRequestID) {
            return { data: response };
        }
        if (response.errorCode) {
            return { error: response };
        }
    }
    /**
     * Validate Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    validate(ok) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Success",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Failed",
            };
    }
    /**
     * Confirm Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    confirm(ok) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Success",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Failed",
            };
    }
    /**
     * Reconcile Transaction Using Instant Payment Notification from M-PESA
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    reconcile(ok) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Service request successful",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Service request failed",
            };
    }
    /**
     * Process Results of an API Request
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    results(ok) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Service request successful",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Service request failed",
            };
    }
    /**
     * Process Transaction Timeout
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    timeout(ok) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Service request successful",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Service request failed",
            };
    }
}
exports.Mpesa = Mpesa;
//# sourceMappingURL=mpesa.js.map