import axios, { AxiosInstance } from "axios";
import * as constants from "constants";
import { Payload, PaymentResponse, StkPushPayload, MpesaConfig } from "./types"
import { format } from "date-fns"
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export class Mpesa {
    /**
     * @var object config Configuration options
     */
    public config: MpesaConfig = {
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

    private http: AxiosInstance

    /**
     * Setup global configuration for classes
     * @var Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: MpesaConfig) {
        const defaults: MpesaConfig = {
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

        this.config = { ...defaults, ...configs };

        this.http = axios.create({
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
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */

    private async authenticate() {
        const auth = "Basic " + Buffer.from(
            this.config.key + ":" + this.config.secret
        ).toString("base64")

        try {
            const { data } = await this.http.get(this.config.env == "live"
                ? "oauth/v1/generate?grant_type=client_credentials"
                : "oauth/v1/generate?grant_type=client_credentials",
                {
                    headers: {
                        "Authorization": auth
                    }
                }
            )

            return data?.access_token;
        } catch (error) {
            return error
        }
    }

    private async generateSecurityCredential() {
        return crypto
            .publicEncrypt(
                {
                    key: fs.readFileSync(
                        path.join(
                            __dirname,
                            "certs",
                            this.config.env,
                            "cert.cer"
                        ),
                        "utf8"
                    ),
                    padding: constants.RSA_PKCS1_PADDING
                },

                Buffer.from(this.config.password)
            )
            .toString("base64");

    }

    /**
     * Perform a GET request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var String credentials Formated Auth credentials
     *
     * @return string/bool
     */
    public async get(endpoint: string, credentials = null) {
        const auth = "Basic " + Buffer.from(
            this.config.key + ":" + this.config.secret
        ).toString("base64")

        return await this.http.get(
            endpoint,
            {
                headers: {
                    "Authorization": auth
                }
            },
        )
    }

    /**
     * Perform a POST request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var Array data Formated array of data to send
     *
     * @return string/bool
     */
    public async post(endpoint: string, payload: any) {
        return this.http.post(
            endpoint,
            payload,
            {
                headers: {
                    "Authorization": "Bearer " + await this.authenticate()
                }
            },
        )
            .then(({ data }) => data)
            .catch((e: any) => {
                return e.response.data
            })
    }

    /**
     * @var Integer phone The MSISDN sending the funds.
     * @var Integer amount The amount to be transacted.
     * @var String reference Used with M-Pesa PayBills.
     * @var String description A description of the transaction.
     * @var String remark Remarks
     *
     * @return array Response
     */
    public async stkPush(
        phone: string | number,
        amount: number,
        reference = "ACCOUNT",
        description = "Transaction Description",
        remark = "Remark"
    ) {
        phone = String(phone)
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;

        const timestamp = format(new Date(), "yyyyMMddHHmmss");
        const password = Buffer.from(
            this.config.shortcode + this.config.passkey + timestamp
        ).toString("base64")

        const endpoint = (this.config.env == "live")
            ? "mpesa/stkpush/v1/processrequest"
            : "mpesa/stkpush/v1/processrequest";

        const payload = {
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
        }

        const response = await this.post(endpoint, payload);

        if (response.MerchantRequestID) {
            return { data: response, error: null }
        }

        if (response.errorCode) {
            return { data: null, error: response }
        }
    }

    public async registerUrls(
        response_type = "Completed"
    ) {
        const endpoint = (this.config.env == "live")
            ? "mpesa/c2b/v1/registerurl"
            : "mpesa/c2b/v1/registerurl";

        const payload = {
            "ShortCode": this.config.store,
            "ResponseType": response_type,
            "ConfirmationURL": this.config.confirmationUrl,
            "ValidationURL": this.config.validationUrl,
        };

        const response = await this.post(endpoint, payload);

        if (response.errorCode) {
            return { data: null, error: response }
        }

        if (response.MerchantRequestID) {
            return { data: response, error: null }
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
     * @return array
     */
    public async simulate(
        phone: string | number,
        amount = 10,
        reference = "TRX",
        command = "",
        callback = null
    ) {
        phone = String(phone)
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;

        const endpoint = (this.config.env == "live")
            ? "mpesa/c2b/v1/simulate"
            : "mpesa/c2b/v1/simulate";

        const payload = {
            ShortCode: this.config.shortcode,
            CommandID: command,
            Amount: Number(amount),
            Msisdn: phone,
            BillRefNumber: reference,
        };

        const response = await this.post(endpoint, payload);

        if (response.MerchantRequestID) {
            return { data: response, error: null }
        }

        if (response.errorCode) {
            return { data: null, error: response }
        }
    }

    public async sendB2C(
        phone: string | number,
        amount = 10,
        command = "BusinessPayment",
        remarks = "",
        occassion = ""
    ) {
        const env = this.config.env;
        phone = String(phone)
        phone = (phone.charAt(0) == "+") ? phone.replace("+", "") : phone;
        phone = (phone.charAt(0) == "0") ? phone.replace("/^0/", "254") : phone;
        phone = (phone.charAt(0) == "7") ? "254" + phone : phone;

        const endpoint = (env == "live")
            ? "mpesa/b2c/v1/paymentrequest"
            : "mpesa/b2c/v1/paymentrequest";

        const body = {
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
        }

        const response = await this.post(endpoint, body)

        if (response.data) {
            return response
        } else {
            return { error: response }
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
  * @return array
  */
    public async sendB2B(
        receiver: string | number,
        receiver_type: string | number,
        amount: number,
        command = "",
        reference = "TRX",
        remarks = "",
        callback = null
    ) {
        const env = this.config.env;
        const plaintext = this.config.password;
        const endpoint = (env == "live")
            ? "mpesa/b2b/v1/paymentrequest"
            : "mpesa/b2b/v1/paymentrequest";

        const payload = {
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
        };

        const response = await this.post(endpoint, payload);

        if (response.MerchantRequestID) {
            return { data: response, error: null }
        }

        if (response.errorCode) {
            return { data: null, error: response }
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
     * @return array Result
     */
    public async checkStatus(
        transaction: string,
        command = "TransactionStatusQuery",
        remarks = "Transaction Status Query",
        occasion = "Transaction Status Query"
    ) {
        const env = this.config.env;

        const endpoint = (env == "live")
            ? "mpesa/transactionstatus/v1/query"
            : "mpesa/transactionstatus/v1/query";

        const payload = {
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
        };

        const response = await this.post(endpoint, payload);

        if (response.MerchantRequestID) {
            return { data: response }
        }

        if (response.errorCode) {
            return { error: response }
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
     * @return array Result
     */
    public async reverseTransaction(
        transaction: string,
        amount: number,
        receiver: number,
        receiver_type = 3,
        remarks = "Transaction Reversal",
        occasion = "Transaction Reversal"
    ) {
        const env = this.config.env;

        const endpoint = (env == "live")
            ? "mpesa/reversal/v1/request"
            : "mpesa/reversal/v1/request";

        const payload = {
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
        };

        const response = await this.post(endpoint, payload);

        if (response.MerchantRequestID) {
            return { data: response }
        }

        if (response.errorCode) {
            return { error: response }
        }
    }

    /**
     * Check Account Balance
     *
     * @var String command
     * @var String remarks
     * @var String occassion
     *
     * @return array Result
     */
    public async checkBalance(
        command: string,
        remarks = "Balance Query",
    ) {
        const env = this.config.env;

        const endpoint = (env == "live")
            ? "mpesa/accountbalance/v1/query"
            : "mpesa/accountbalance/v1/query";

        const payload = {
            CommandID: command,
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(),
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeoutUrl,
            ResultURL: this.config.resultUrl,
        };

        const response = await this.post(endpoint, payload);

        if (response.MerchantRequestID) {
            return { data: response }
        }

        if (response.errorCode) {
            return { error: response }
        }
    }

    /**
     * Validate Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public validate(ok: boolean) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Success",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Failed",
            }
    }

    /**
     * Confirm Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public confirm(ok: boolean) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Success",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Failed",
            }
    }

    /**
     * Reconcile Transaction Using Instant Payment Notification from M-PESA
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public reconcile(ok: boolean) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Service request successful",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Service request failed",
            }
    }

    /**
     * Process Results of an API Request
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public results(ok: boolean) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Service request successful",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Service request failed",
            }
    }

    /**
     * Process Transaction Timeout
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public timeout(ok: boolean) {
        return ok
            ? {
                "ResultCode": 0,
                "ResultDesc": "Service request successful",
            }
            : {
                "ResultCode": 1,
                "ResultDesc": "Service request failed",
            }
    }
}