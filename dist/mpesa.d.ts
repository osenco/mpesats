import { BillManager } from "./billing";
import { Service } from "./service";
import { MpesaResponse, B2BCommands, B2CCommands, MpesaConfig, ResponseType } from "./types";
export declare class Mpesa {
    protected service: Service;
    /**
     * @param object config Configuration options
     */
    config: MpesaConfig;
    ref: string;
    /**
     * Setup global configuration for classes
     * @param Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: MpesaConfig);
    billing(): BillManager;
    /**
     * @param phone The MSISDN sending the funds.
     * @param amount The amount to be transacted.
     * @param reference Used with M-Pesa PayBills.
     * @param description A description of the transaction.
     * @param remark Remarks
     *
     * @return Promise<MpesaResponse> Response
     */
    stkPush(phone: string | number, amount: number, reference?: string | number, description?: string, remark?: string): Promise<MpesaResponse>;
    registerUrls(response_type?: ResponseType): Promise<MpesaResponse>;
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
    simulateC2B(phone: string | number, amount?: number, reference?: string | number, command?: string): Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    } | undefined>;
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
    sendB2C(phone: string | number, amount?: number, command?: B2CCommands, remarks?: string, occassion?: string): Promise<MpesaResponse>;
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
    sendB2B(receiver: string | number, receiver_type: string | number, amount: number, command?: B2BCommands, reference?: string | number, remarks?: string): Promise<MpesaResponse>;
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
    generateQR(Amount: string, MerchantName: string, CPI: string, RefNo: string, TrxCode?: string, QRVersion?: string, QRFormat?: string, QRType?: string): Promise<MpesaResponse>;
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
    checkStatus(transaction: string, command?: string, remarks?: string, occasion?: string): Promise<MpesaResponse>;
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
    reverseTransaction(transaction: string, amount: number, receiver: number, receiver_type?: number, remarks?: string, occasion?: string): Promise<MpesaResponse>;
    /**
     * Check Account Balance
     *
     * @param command
     * @param remarks
     * @param occassion
     *
     * @return Promise<any> Result
     */
    checkBalance(command: string, remarks?: string): Promise<MpesaResponse>;
    /**
     * Validate Transaction Data
     *
     * @param callback Defined function or closure to process data and return true/false
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
     * @param callback Defined function or closure to process data and return true/false
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
     * @param callback Defined function or closure to process data and return true/false
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
     * @param callback Defined function or closure to process data and return true/false
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
     * @param callback Defined function or closure to process data and return true/false
     *
     * @return Promise<any>
     */
    processTimeout(ok: boolean): {
        ResultCode: number;
        ResultDesc: string;
    };
}
