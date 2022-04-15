"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMpesa = void 0;
const axios_1 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
const billing_1 = require("./billing");
const service_1 = require("./service");
const useMpesa = (configs, token = null) => {
    const ref = Math.random().toString(16).slice(2, 8).toUpperCase();
    /**
     * Setup global configuration for classes
     * @param MpesaConfig configs Formatted configuration options
     *
     * @return void
     */
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
        billingUrl: "/lipwa/billing",
    };
    if (!configs || !configs.store || configs.type == 4) {
        configs.store = configs.shortcode;
    }
    const config = Object.assign(Object.assign({}, defaults), configs);
    const service = new service_1.Service(config);
    if (token) {
        service.token = token;
    }
    else {
        service.authenticate();
    }
    const http = axios_1.default.create({
        baseURL: config.env == "live"
            ? "https://api.safaricom.co.ke"
            : "https://sandbox.safaricom.co.ke",
        withCredentials: true,
    });
    http.defaults.headers.common = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    function billManager() {
        return new billing_1.BillManager(configs);
    }
    /**
     * @param phone The MSISDN sending the funds.
     * @param amount The amount to be transacted.
     * @param reference Used with M-Pesa PayBills.
     * @param description A description of the transaction.
     * @param remark Remarks
     *
     * @return Promise<MpesaResponse> Response
     */
    async function stkPush(phone, amount, reference = ref, description = "Transaction Description", remark = "Remark") {
        phone = (phone);
        phone = "254" + +String(phone).slice(-9);
        const timestamp = (0, date_fns_1.format)(new Date(), "yyyyMMddHHmmss");
        const password = Buffer.from(config.shortcode + config.passkey + timestamp).toString("base64");
        const response = await service.post("mpesa/stkpush/v1/processrequest", {
            BusinessShortCode: config.store,
            Password: password,
            Timestamp: timestamp,
            TransactionType: Number(config.type) == 4
                ? "CustomerPayBillOnline"
                : "CustomerBuyGoodsOnline",
            Amount: Number(amount),
            PartyA: phone,
            PartyB: config.shortcode,
            PhoneNumber: phone,
            CallBackURL: config.callbackUrl,
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
        return response;
    }
    async function registerUrls(response_type = "Completed") {
        const response = await service.post("mpesa/c2b/v1/registerurl", {
            ShortCode: config.store,
            ResponseType: response_type,
            ConfirmationURL: config.confirmationUrl,
            ValidationURL: config.validationUrl,
        });
        if (response.errorCode) {
            return { data: null, error: response };
        }
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        return response;
    }
    /**
     * Simulates a C2B request
     *
     * @param phone Receiving party phone
     * @param amount Amount to transfer
     * @param command Command ID
     * @param reference
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    async function simulateC2B(phone, amount = 10, reference = "TRX", command = "") {
        phone = (phone);
        phone = "254" + +String(phone).slice(-9);
        const response = await service.post("mpesa/c2b/v1/simulate", {
            ShortCode: config.shortcode,
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
    async function sendB2C(phone, amount = 10, command = "BusinessPayment", remarks = "", occassion = "") {
        phone = (phone);
        phone = "254" + +String(phone).slice(-9);
        const response = await service.post("mpesa/b2c/v1/paymentrequest", {
            InitiatorName: config.username,
            SecurityCredential: await service.generateSecurityCredential(),
            CommandID: command,
            Amount: Number(amount),
            PartyA: config.shortcode,
            PartyB: phone,
            Remarks: remarks,
            QueueTimeOutURL: config.timeoutUrl,
            ResultURL: config.resultUrl,
            Occasion: occassion,
        });
        if (response.OriginatorConversationID) {
            return { data: response, error: null };
        }
        if (response.ResultCode && response.ResultCode !== 0) {
            return {
                data: null,
                error: {
                    errorCode: response.ResultCode,
                    errorMessage: response.ResultDesc,
                },
            };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
        return response;
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
    async function sendB2B(receiver, receiver_type, amount, command = "BusinessBuyGoods", reference = "TRX", remarks = "") {
        const response = await service.post("mpesa/b2b/v1/paymentrequest", {
            Initiator: config.username,
            SecurityCredential: await service.generateSecurityCredential(),
            CommandID: command,
            SenderIdentifierType: config.type,
            RecieverIdentifierType: receiver_type,
            Amount: amount,
            PartyA: config.shortcode,
            PartyB: receiver,
            AccountReference: reference,
            Remarks: remarks,
            QueueTimeOutURL: config.timeoutUrl,
            ResultURL: config.resultUrl,
        });
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
        return response;
    }
    /**
     * Get Status of a Transaction
     *
     * @param transaction
     * @param command
     * @param remarks
     * @param occassion
     *
     * @return Promise<any> Result
     */
    async function checkStatus(transaction, command = "TransactionStatusQuery", remarks = "Transaction Status Query", occasion = "Transaction Status Query") {
        const response = await service.post("mpesa/transactionstatus/v1/query", {
            Initiator: config.username,
            SecurityCredential: await service.generateSecurityCredential(),
            CommandID: command,
            TransactionID: transaction,
            PartyA: config.shortcode,
            IdentifierType: config.type,
            ResultURL: config.resultUrl,
            QueueTimeOutURL: config.timeoutUrl,
            Remarks: remarks,
            Occasion: occasion,
        });
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
        return { data: response, error: null };
    }
    /**
     * Reverse a Transaction
     *
     * @param transaction
     * @param amount
     * @param receiver
     * @param receiver_type
     * @param remarks
     * @param occassion
     *
     * @return Promise<any> Result
     */
    async function reverseTransaction(transaction, amount, receiver, receiver_type = 3, remarks = "Transaction Reversal", occasion = "Transaction Reversal") {
        const response = await service.post("mpesa/reversal/v1/request", {
            CommandID: "TransactionReversal",
            Initiator: config.username,
            SecurityCredential: await service.generateSecurityCredential(),
            TransactionID: transaction,
            Amount: amount,
            ReceiverParty: receiver,
            RecieverIdentifierType: receiver_type,
            ResultURL: config.resultUrl,
            QueueTimeOutURL: config.timeoutUrl,
            Remarks: remarks,
            Occasion: occasion,
        });
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
        return response;
    }
    /**
     * Check Account Balance
     *
     * @param command
     * @param remarks
     * @param occassion
     *
     * @return Promise<any> Result
     */
    async function checkBalance(command, remarks = "Balance Query") {
        const response = await service.post("mpesa/accountbalance/v1/query", {
            CommandID: command,
            Initiator: config.username,
            SecurityCredential: await service.generateSecurityCredential(),
            PartyA: config.shortcode,
            IdentifierType: config.type,
            Remarks: remarks,
            QueueTimeOutURL: config.timeoutUrl,
            ResultURL: config.resultUrl,
        });
        if (response.MerchantRequestID) {
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
        return response;
    }
    /**
     * Validate Transaction Data
     *
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    function validateTransaction(ok) {
        return ok
            ? {
                ResultCode: 0,
                ResultDesc: "Success",
            }
            : {
                ResultCode: 1,
                ResultDesc: "Failed",
            };
    }
    /**
     * Confirm Transaction Data
     *
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    function confirmTransaction(ok, data, callback) {
        if (callback) {
            ok = callback(data);
        }
        return ok
            ? {
                ResultCode: 0,
                ResultDesc: "Success",
            }
            : {
                ResultCode: 1,
                ResultDesc: "Failed",
            };
    }
    /**
     * Reconcile Transaction Using Instant Payment Notification from M-PESA
     *
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    function reconcileTransaction(ok) {
        return ok
            ? {
                ResultCode: 0,
                ResultDesc: "Service request successful",
            }
            : {
                ResultCode: 1,
                ResultDesc: "Service request failed",
            };
    }
    /**
     * Process Results of an API Request
     *
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    function processResults(ok) {
        return ok
            ? {
                ResultCode: 0,
                ResultDesc: "Service request successful",
            }
            : {
                ResultCode: 1,
                ResultDesc: "Service request failed",
            };
    }
    /**
     * Process Transaction Timeout
     *
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    function processTimeout(callback, ok) {
        return ok
            ? {
                ResultCode: 0,
                ResultDesc: "Service request successful",
            }
            : {
                ResultCode: 1,
                ResultDesc: "Service request failed",
            };
    }
    return {
        billManager,
        stkPush,
        registerUrls,
        simulateC2B,
        sendB2B,
        sendB2C,
        checkBalance,
        checkStatus,
        reverseTransaction,
        validateTransaction,
        confirmTransaction,
        reconcileTransaction,
        processResults,
        processTimeout,
    };
};
exports.useMpesa = useMpesa;
//# sourceMappingURL=useMpesa.js.map