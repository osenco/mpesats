export declare class Mpesa {
    /**
     * @var object config Configuration options
     */
    config: {
        env: string;
        type: number;
        shortcode: string;
        headoffice: string;
        key: string;
        secret: string;
        username: string;
        password: string;
        passkey: string;
        validationUrl: string;
        confirmationUrl: string;
        callbackUrl: string;
        timeoutUrl: string;
        resultsUrl: string;
    };
    /**
     * Setup global configuration for classes
     * @var Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: any);
    /**
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */
    private authenticate;
    private generateSecurityCredential;
    /**
     * Perform a GET request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var String credentials Formated Auth credentials
     *
     * @return string/bool
     */
    get(endpoint: string, credentials?: null): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Perform a POST request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var Array data Formated array of data to send
     *
     * @return string/bool
     */
    post(endpoint: string, payload: any): Promise<any>;
    /**
     * @var Integer phone The MSISDN sending the funds.
     * @var Integer amount The amount to be transacted.
     * @var String reference Used with M-Pesa PayBills.
     * @var String description A description of the transaction.
     * @var String remark Remarks
     *
     * @return array Response
     */
    stkPush(phone: string | number, amount: number, reference?: string, description?: string, remark?: string): Promise<{
        data: any;
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    } | undefined>;
    b2cSend(phone: string, amount?: number, command?: string, remarks?: string, occassion?: string): Promise<{
        data: any;
        error?: undefined;
    } | {
        error: string;
        data?: undefined;
    }>;
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
    checkStatus(transaction: string, command?: string, remarks?: string, occasion?: string): Promise<{
        data: any;
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    } | undefined>;
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
    reverseTransaction(transaction: string, amount: number, receiver: number, receiver_type?: number, remarks?: string, occasion?: string): Promise<{
        data: any;
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    } | undefined>;
    /**
     * Check Account Balance
     *
     * @var String command
     * @var String remarks
     * @var String occassion
     *
     * @return array Result
     */
    checkBalance(command: string, remarks?: string): Promise<{
        data: any;
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    } | undefined>;
    /**
     * Validate Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    validate(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Confirm Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    confirm(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Reconcile Transaction Using Instant Payment Notification from M-PESA
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    reconcile(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Process Results of an API Request
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    results(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Process Transaction Timeout
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    timeout(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
}
