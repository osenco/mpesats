import { MpesaResponse, B2BCommands, B2CCommands, MpesaConfig, ResponseType } from "./types";
export declare const useMpesa: (configs: MpesaConfig) => {
    stkPush: (phone: string | number, amount: number, reference?: string | number, description?: string, remark?: string) => Promise<MpesaResponse>;
    registerUrls: (response_type?: ResponseType) => Promise<MpesaResponse>;
    simulateC2B: (phone: string | number, amount?: number, reference?: string | number, command?: string) => Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    } | undefined>;
    sendB2B: (receiver: string | number, receiver_type: string | number, amount: number, command?: B2BCommands, reference?: string | number, remarks?: string) => Promise<MpesaResponse>;
    sendB2C: (phone: string | number, amount?: number, command?: B2CCommands, remarks?: string, occassion?: string) => Promise<MpesaResponse>;
    checkBalance: (command: string, remarks?: string) => Promise<MpesaResponse>;
    checkStatus: (transaction: string, command?: string, remarks?: string, occasion?: string) => Promise<MpesaResponse>;
    reverseTransaction: (transaction: string, amount: number, receiver: number, receiver_type?: number, remarks?: string, occasion?: string) => Promise<MpesaResponse>;
    validateTransaction: (ok: boolean) => {
        ResultCode: number;
        ResultDesc: string;
    };
    confirmTransaction: (ok: boolean) => {
        ResultCode: number;
        ResultDesc: string;
    };
    reconcileTransaction: (ok: boolean) => {
        ResultCode: number;
        ResultDesc: string;
    };
    processResults: (ok: boolean) => {
        ResultCode: number;
        ResultDesc: string;
    };
    processTimeout: (ok: boolean) => {
        ResultCode: number;
        ResultDesc: string;
    };
};
