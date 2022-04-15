"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mpesa = void 0;
const date_fns_1 = require("date-fns");
const billing_1 = require("./billing");
const service_1 = require("./service");
class Mpesa {
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
        this.ref = Math.random().toString(16).slice(2, 8).toUpperCase();
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
        this.config = Object.assign(Object.assign({}, defaults), configs);
        this.service = new service_1.Service(this.config);
    }
    billing() {
        return new billing_1.BillManager(this.config);
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
    async stkPush(phone, amount, reference = this.ref, description = "Transaction Description", remark = "Remark") {
        phone = "254" + String(phone).slice(-9);
        const timestamp = (0, date_fns_1.format)(new Date(), "yyyyMMddHHmmss");
        const password = Buffer.from(this.config.shortcode + this.config.passkey + timestamp).toString("base64");
        const response = await this.service.post("mpesa/stkpush/v1/processrequest", {
            BusinessShortCode: this.config.store,
            Password: password,
            Timestamp: timestamp,
            TransactionType: Number(this.config.type) == 4
                ? "CustomerPayBillOnline"
                : "CustomerBuyGoodsOnline",
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
        return response;
    }
    async registerUrls(response_type = "Completed") {
        const response = await this.service.post("mpesa/c2b/v1/registerurl", {
            ShortCode: this.config.store,
            ResponseType: response_type,
            ConfirmationURL: this.config.confirmationUrl,
            ValidationURL: this.config.validationUrl,
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
    async simulateC2B(phone, amount = 10, reference = "TRX", command = "") {
        phone = "254" + String(phone).slice(-9);
        const response = await this.service.post("mpesa/c2b/v1/simulate", {
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
        phone = "254" + String(phone).slice(-9);
        const response = await this.service.post("mpesa/b2c/v1/paymentrequest", {
            InitiatorName: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
            CommandID: command,
            Amount: Number(amount),
            PartyA: this.config.shortcode,
            PartyB: phone,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeoutUrl,
            ResultURL: this.config.resultUrl,
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
    async sendB2B(receiver, receiver_type, amount, command = "BusinessBuyGoods", reference = "TRX", remarks = "") {
        const response = await this.service.post("mpesa/b2b/v1/paymentrequest", {
            Initiator: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
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
        return response;
    }
    /**
     * Generate QR Code
     * @param QRVersion Version number of the QR. e.g "01"
     * @param QRFormat Format of QR output: ("1": Image Format. "2": QR Format. "3": Binary Data Format. "4": PDF Format.)
     * @param QRType The type of QR being used : ("D": Dynamic QR Type)
     * @param MerchantName Name of the Company/M-Pesa Merchant Name
     * @param RefNo Transaction Reference
     * @param Amount The total amount for the sale/transaction
     * @param TrxCode Transaction Type: (BG: Pay Merchant (Buy Goods). WA: Withdraw Cash at Agent Till. PB: Paybill or Business number. SM: Send Money(Mobile number). SB: Sent to Business. Business number CPI in MSISDN format.
     * @param CPI Credit Party Identifier. Can be a Mobile Number, Business Number, Agent Till, Paybill or Business number, Merchant Buy Goods.
     */
    async generateQR(Amount, MerchantName, CPI, RefNo, TrxCode = "BG", QRVersion = "01", QRFormat = "1", QRType = "D") {
        const response = await this.service.post("mpesa/qrcode/v1/generate", {
            QRVersion,
            QRFormat,
            QRType,
            MerchantName,
            RefNo,
            Amount: Number(Amount),
            TrxCode,
            CPI,
        });
        if (response.QRCode) {
            return { data: response, error: null };
        }
        else {
            return { data: null, error: response };
        }
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
    async checkStatus(transaction, command = "TransactionStatusQuery", remarks = "Transaction Status Query", occasion = "Transaction Status Query") {
        const response = await this.service.post("mpesa/transactionstatus/v1/query", {
            Initiator: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
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
            return { data: response, error: null };
        }
        if (response.errorCode) {
            return { data: null, error: response };
        }
        return response;
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
    async reverseTransaction(transaction, amount, receiver, receiver_type = 3, remarks = "Transaction Reversal", occasion = "Transaction Reversal") {
        const response = await this.service.post("mpesa/reversal/v1/request", {
            CommandID: "TransactionReversal",
            Initiator: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
            TransactionID: transaction,
            Amount: amount,
            ReceiverParty: receiver,
            RecieverIdentifierType: receiver_type,
            ResultURL: this.config.resultUrl,
            QueueTimeOutURL: this.config.timeoutUrl,
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
    async checkBalance(command, remarks = "Balance Query") {
        const response = await this.service.post("mpesa/accountbalance/v1/query", {
            CommandID: command,
            Initiator: this.config.username,
            SecurityCredential: await this.service.generateSecurityCredential(),
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
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
        return response;
    }
    /**
     * Validate Transaction Data
     *
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    validateTransaction(ok) {
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
    confirmTransaction(ok) {
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
    reconcileTransaction(ok) {
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
    processResults(ok) {
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
    processTimeout(ok) {
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
}
exports.Mpesa = Mpesa;
//# sourceMappingURL=mpesa.js.map