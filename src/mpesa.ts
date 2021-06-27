import axios from 'axios';
import dotenv from 'dotenv'
import * as constants from 'constants';
import { Payload, PaymentResponse, StkPushPayload } from './types'
import { format } from 'date-fns'
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config()

export class Service {
    /**
     * @var object config Configuration options
     */
    public config: any;

    /**
     * Setup global configuration for classes
     * @param Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: any) {
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
            validation_url: "/lipwa/validate",
            confirmation_url: "/lipwa/confirm",
            callback_url: "/lipwa/reconcile",
            timeout_url: "/lipwa/timeout",
            results_url: "/lipwa/results",
        };

        if (!configs && !configs.headoffice) {
            defaults.headoffice = configs.shortcode;
        }

        Object.keys(defaults).forEach((key: string | number) => {
            if (configs[key]) {
                (defaults as any)[key] = configs[key];
            }
        })

        this.config = defaults;
    }

    /**
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */

    private async authenticate() {
        const auth = 'Basic ' + Buffer.from(
            this.config.key + ':' + this.config.secret
        ).toString('base64')

        const { data } = await axios.get(this.config.env == 'live'
            ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    'Authorization': auth
                }
            }
        )

        return data?.access_token;
    }

    private async generateSecurityCredential(
        password: string
    ) {
        return crypto
            .publicEncrypt(
                {
                    key: fs.readFileSync(
                        path.join(
                            __dirname,
                            'certs',
                            this.config.env,
                            'cert.cer'
                        ),
                        'utf8'
                    ),
                    padding: constants.RSA_PKCS1_PADDING
                },

                Buffer.from(password)
            )
            .toString('base64');

    }

    /**
     * Perform a GET request to the M-PESA Daraja API
     * @param String endpoint Daraja API URL Endpoint
     * @param String credentials Formated Auth credentials
     *
     * @return string/bool
     */
    public async get(endpoint: string, credentials = null) {
        return axios.post(
            endpoint,
            {
                headers: {
                    'Authorization': 'Bearer ' + await this.authenticate()
                }
            },
        )
            .then(res => res.data)
            .catch(err => err.response.data)
    }

    /**
     * Perform a POST request to the M-PESA Daraja API
     * @param String endpoint Daraja API URL Endpoint
     * @param Array data Formated array of data to send
     *
     * @return string/bool
     */
    public async post(endpoint: string, data: any) {
        return await axios.post(
            endpoint,
            data,
            {
                headers: {
                    'Authorization': 'Bearer ' + await this.authenticate()
                }
            },
        )
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
            this.config.shortcode.this.config.passkey.timestamp
        ).toString('base64')

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
            CallBackURL: this.config.callback_url,
            AccountReference: reference,
            TransactionDesc: description,
            Remark: remark,
        }

        return await this.post(endpoint, data);
    }

    public async b2cSend(
        phone: string,
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
        const plaintext = this.config.password;

        const endpoint = (env == "live")
            ? "https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest"
            : "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest";
            
        const body = {
            InitiatorName: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(plaintext),
            CommandID: command,
            Amount: Number(amount),
            PartyA: this.config.shortcode,
            PartyB: phone,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeout_url,
            ResultURL: this.config.results_url,
            Occasion: occassion
        }

        const { data } = await this.post(endpoint, body)

        if (data) {
            return { data }
        } else {
            return { error: "" }
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
    public async checkStatus(
        transaction: string,
        command = "TransactionStatusQuery",
        remarks = "Transaction Status Query",
        occasion = "Transaction Status Query"
    ) {
        const env = this.config.env;
        const plaintext = this.config.password;

        const endpoint = (env == "live")
            ? "https://api.safaricom.co.kelipwa/transactionstatus/v1/query"
            : "https://sandbox.safaricom.co.kelipwa/transactionstatus/v1/query";

        const data = {
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(plaintext),
            CommandID: command,
            TransactionID: transaction,
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
            ResultURL: this.config.results_url,
            QueueTimeOutURL: this.config.timeout_url,
            Remarks: remarks,
            Occasion: occasion,
        };

        return await this.post(endpoint, data)
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
    public async reverseTransaction(
        transaction: string,
        amount: number,
        receiver: number,
        receiver_type = 3,
        remarks = "Transaction Reversal",
        occasion = "Transaction Reversal"
    ) {
        const env = this.config.env;
        const plaintext = this.config.password;

        const endpoint = (env == "live")
            ? "https://api.safaricom.co.kelipwa/reversal/v1/request"
            : "https://sandbox.safaricom.co.kelipwa/reversal/v1/request";

        const data = {
            CommandID: "TransactionReversal",
            Initiator: this.config.business,
            SecurityCredential: await this.generateSecurityCredential(plaintext),
            TransactionID: transaction,
            Amount: amount,
            ReceiverParty: receiver,
            RecieverIdentifierType: receiver_type,
            ResultURL: this.config.results_url,
            QueueTimeOutURL: this.config.timeout_url,
            Remarks: remarks,
            Occasion: occasion
        };

        return await this.post(endpoint, data)
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
    public async checkBalance(
        command: string,
        remarks = "Balance Query",
    ) {
        const env = this.config.env;
        const plaintext = this.config.password;

        const endpoint = (env == "live")
            ? "https://api.safaricom.co.kelipwa/accountbalance/v1/query"
            : "https://sandbox.safaricom.co.kelipwa/accountbalance/v1/query";

        const data = {
            CommandID: command,
            Initiator: this.config.username,
            SecurityCredential: await this.generateSecurityCredential(plaintext),
            PartyA: this.config.shortcode,
            IdentifierType: this.config.type,
            Remarks: remarks,
            QueueTimeOutURL: this.config.timeout_url,
            ResultURL: this.config.results_url,
        };

        return await this.post(endpoint, data)
    }

    /**
     * Validate Transaction Data
     *
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public async validate(ok: boolean) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public async confirm(ok: boolean) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public async reconcile(ok: boolean) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public async results(ok: boolean) {
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
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    public async timeout(ok: boolean) {
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