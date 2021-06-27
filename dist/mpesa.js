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
const dotenv_1 = __importDefault(require("dotenv"));
const constants = __importStar(require("constants"));
const date_fns_1 = require("date-fns");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
dotenv_1.default.config();
class Mpesa {
    /**
     * Setup global configuration for classes
     * @param Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs) {
        const defaults = {
            env: "sandbox",
            type: 4,
            shortcode: "174379",
            headoffice: "174379",
            key: "Your Consumer Key",
            secret: "Your Consumer Secret",
            username: "apitest",
            password: "",
            passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
            validationUrl: "/lipwa/validate",
            confirmationUrl: "/lipwa/confirm",
            callbackUrl: "/lipwa/reconcile",
            timeoutUrl: "/lipwa/timeout",
            resultsUrl: "/lipwa/results",
        };
        if (!configs && !configs.headoffice) {
            defaults.headoffice = configs.shortcode;
        }
        Object.keys(defaults).forEach((key) => {
            if (configs[key]) {
                defaults[key] = configs[key];
            }
        });
        this.config = defaults;
    }
    /**
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */
    async authenticate() {
        const auth = 'Basic ' + Buffer.from(this.config.key + ':' + this.config.secret).toString('base64');
        const { data } = await axios_1.default.get(this.config.env == 'live'
            ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: {
                'Authorization': auth
            }
        });
        return data === null || data === void 0 ? void 0 : data.access_token;
    }
    async generateSecurityCredential() {
        return crypto
            .publicEncrypt({
            key: fs.readFileSync(path.join(__dirname, 'certs', this.config.env, 'cert.cer'), 'utf8'),
            padding: constants.RSA_PKCS1_PADDING
        }, Buffer.from(this.config.password))
            .toString('base64');
    }
    /**
     * Perform a GET request to the M-PESA Daraja API
     * @param String endpoint Daraja API URL Endpoint
     * @param String credentials Formated Auth credentials
     *
     * @return string/bool
     */
    async get(endpoint, credentials = null) {
        return await axios_1.default.post(endpoint, {
            headers: {
                'Authorization': 'Bearer ' + await this.authenticate()
            }
        });
    }
    /**
     * Perform a POST request to the M-PESA Daraja API
     * @param String endpoint Daraja API URL Endpoint
     * @param Array data Formated array of data to send
     *
     * @return string/bool
     */
    async post(endpoint, data) {
        return await axios_1.default.post(endpoint, data, {
            headers: {
                'Authorization': 'Bearer ' + await this.authenticate()
            }
        });
    }
    /**
     * @param Integer phone The MSISDN sending the funds.
     * @param Integer amount The amount to be transacted.
     * @param String reference Used with M-Pesa PayBills.
     * @param String description A description of the transaction.
     * @param String remark Remarks
     *
     * @return array Response
     */
    async stkPush(phone, amount, reference = "ACCOUNT", description = "Transaction Description", remark = "Remark") {
        phone = String(phone);
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;
        const timestamp = date_fns_1.format(new Date(), "yyyyMMddHHmmss");
        const password = Buffer.from(this.config.shortcode.this.config.passkey.timestamp).toString('base64');
        const endpoint = (this.config.env == "live")
            ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
        const data = {
            BusinessShortCode: this.config.headoffice,
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
        };
        return await this.post(endpoint, data);
    }
    async b2cSend(phone, amount = 10, command = "BusinessPayment", remarks = "", occassion = "") {
        const env = this.config.env;
        phone = String(phone);
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;
        const endpoint = (env == "live")
            ? "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest"
            : "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
        const body = {
            InitiatorName: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            CommandID: command,
            Amount: Number(amount),
            PartyA: this.config.shortcode,
            PartyB: phone,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeoutUrl,
            ResultURL: this.config.resultsUrl,
            Occasion: occassion
        };
        const { data } = await this.post(endpoint, body);
        if (data) {
            return { data };
        }
        else {
            return { error: "" };
        }
    }
    /**
     * Get Status of a Transaction
     *
     * @param String transaction
     * @param String command
     * @param String remarks
     * @param String occassion
     *
     * @return array Result
     */
    async checkStatus(transaction, command = "TransactionStatusQuery", remarks = "Transaction Status Query", occasion = "Transaction Status Query") {
        const env = this.config.env;
        const endpoint = (env == "live")
            ? "https://api.safaricom.co.kelipwa/transactionstatus/v1/query"
            : "https://sandbox.safaricom.co.kelipwa/transactionstatus/v1/query";
        const data = {
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            CommandID: command,
            TransactionID: transaction,
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
            ResultURL: this.config.resultsUrl,
            QueueTimeOutURL: this.config.timeoutUrl,
            Remarks: remarks,
            Occasion: occasion,
        };
        return await this.post(endpoint, data);
    }
    /**
     * Reverse a Transaction
     *
     * @param String transaction
     * @param Integer amount
     * @param Integer receiver
     * @param String receiver_type
     * @param String remarks
     * @param String occassion
     *
     * @return array Result
     */
    async reverseTransaction(transaction, amount, receiver, receiver_type = 3, remarks = "Transaction Reversal", occasion = "Transaction Reversal") {
        const env = this.config.env;
        const endpoint = (env == "live")
            ? "https://api.safaricom.co.kelipwa/reversal/v1/request"
            : "https://sandbox.safaricom.co.kelipwa/reversal/v1/request";
        const data = {
            CommandID: "TransactionReversal",
            Initiator: this.config.business,
            SecurityCredential: await this.generateSecurityCredential(),
            TransactionID: transaction,
            Amount: amount,
            ReceiverParty: receiver,
            RecieverIdentifierType: receiver_type,
            ResultURL: this.config.resultsUrl,
            QueueTimeOutURL: this.config.timeoutUrl,
            Remarks: remarks,
            Occasion: occasion
        };
        return await this.post(endpoint, data);
    }
    /**
     * Check Account Balance
     *
     * @param String command
     * @param String remarks
     * @param String occassion
     *
     * @return array Result
     */
    async checkBalance(command, remarks = "Balance Query") {
        const env = this.config.env;
        const endpoint = (env == "live")
            ? "https://api.safaricom.co.kelipwa/accountbalance/v1/query"
            : "https://sandbox.safaricom.co.kelipwa/accountbalance/v1/query";
        const data = {
            CommandID: command,
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeoutUrl,
            ResultURL: this.config.resultsUrl,
        };
        return await this.post(endpoint, data);
    }
    /**
     * Validate Transaction Data
     *
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    async validate(ok) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    async confirm(ok) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    async reconcile(ok) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    async results(ok) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    async timeout(ok) {
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