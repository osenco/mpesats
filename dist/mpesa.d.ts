import { MpesaResponse, B2BCommands, B2CCommands, MpesaConfig, ResponseType } from "./types";
export declare class Mpesa {
    private service;
    /**
     * @var object config Configuration options
     */
    config: MpesaConfig;
    ref: string;
    /**
     * Setup global configuration for classes
     * @var Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: MpesaConfig);
    /**
     * @var Integer phone The MSISDN sending the funds.
     * @var Integer amount The amount to be transacted.
     * @var String reference Used with M-Pesa PayBills.
     * @var String description A description of the transaction.
     * @var String remark Remarks
     *
     * @return Promise<any> Response
     */
    stkPush(phone: string | number, amount: number, reference?: string | number, description?: string, remark?: string): Promise<MpesaResponse>;
    registerUrls(response_type?: ResponseType): Promise<MpesaResponse>;
    /**
     * Simulates a C2B request
     *
     * @var Integer phone Receiving party phone
     * @var Integer amount Amount to transfer
     * @var String command Command ID
     * @var String reference
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    simulateC2B(phone: string | number, amount?: number, reference?: string | number, command?: string): Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    } | undefined>;
    /**
     * Transfer funds between two paybills
     * @var receiver Receiving party phone
     * @var amount Amount to transfer
     * @var command Command ID
     * @var occassion
     * @var remarks
     *
     * @return Promise<any>
     */
    sendB2C(phone: string | number, amount?: number, command?: B2CCommands, remarks?: string, occassion?: string): Promise<MpesaResponse>;
    /**
  * Transfer funds between two paybills
  * @var receiver Receiving party paybill
  * @var receiver_type Receiver party type
  * @var amount Amount to transfer
  * @var command Command ID
  * @var reference Account Reference mandatory for “BusinessPaybill” CommandID.
  * @var remarks
  *
  * @return Promise<any>
  */
    sendB2B(receiver: string | number, receiver_type: string | number, amount: number, command?: B2BCommands, reference?: string | number, remarks?: string): Promise<MpesaResponse>;
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
    checkStatus(transaction: string, command?: string, remarks?: string, occasion?: string): Promise<MpesaResponse>;
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
    reverseTransaction(transaction: string, amount: number, receiver: number, receiver_type?: number, remarks?: string, occasion?: string): Promise<MpesaResponse>;
    /**
     * Check Account Balance
     *
     * @var String command
     * @var String remarks
     * @var String occassion
     *
     * @return Promise<any> Result
     */
    checkBalance(command: string, remarks?: string): Promise<MpesaResponse>;
    /**
     * Validate Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    validateTransaction(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Confirm Transaction Data
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    confirmTransaction(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Reconcile Transaction Using Instant Payment Notification from M-PESA
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    reconcileTransaction(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Process Results of an API Request
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    processResults(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
    /**
     * Process Transaction Timeout
     *
     * @var Callable callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    processTimeout(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
}
