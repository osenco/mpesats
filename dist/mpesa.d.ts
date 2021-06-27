export declare class Mpesa {
    /**
     * @var object config Configuration options
     */
    config: any;
    /**
     * Setup global configuration for classes
     * @param Array configs Formatted configuration options
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
     * @param String endpoint Daraja API URL Endpoint
     * @param String credentials Formated Auth credentials
     *
     * @return string/bool
     */
    get(endpoint: string, credentials?: null): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Perform a POST request to the M-PESA Daraja API
     * @param String endpoint Daraja API URL Endpoint
     * @param Array data Formated array of data to send
     *
     * @return string/bool
     */
    post(endpoint: string, data: any): Promise<import("axios").AxiosResponse<any>>;
    /**
     * @param Integer phone The MSISDN sending the funds.
     * @param Integer amount The amount to be transacted.
     * @param String reference Used with M-Pesa PayBills.
     * @param String description A description of the transaction.
     * @param String remark Remarks
     *
     * @return array Response
     */
    stkPush(phone: string | number, amount: number, reference?: string, description?: string, remark?: string): Promise<import("axios").AxiosResponse<any>>;
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
     * @param String transaction
     * @param String command
     * @param String remarks
     * @param String occassion
     *
     * @return array Result
     */
    checkStatus(transaction: string, command?: string, remarks?: string, occasion?: string): Promise<import("axios").AxiosResponse<any>>;
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
    reverseTransaction(transaction: string, amount: number, receiver: number, receiver_type?: number, remarks?: string, occasion?: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Check Account Balance
     *
     * @param String command
     * @param String remarks
     * @param String occassion
     *
     * @return array Result
     */
    checkBalance(command: string, remarks?: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Validate Transaction Data
     *
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    validate(ok: boolean): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    /**
     * Confirm Transaction Data
     *
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    confirm(ok: boolean): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    /**
     * Reconcile Transaction Using Instant Payment Notification from M-PESA
     *
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    reconcile(ok: boolean): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    /**
     * Process Results of an API Request
     *
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    results(ok: boolean): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    /**
     * Process Transaction Timeout
     *
     * @param Callable callback Defined function or closure to process data and return true/false
     *
     * @return array
     */
    timeout(ok: boolean): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
}
