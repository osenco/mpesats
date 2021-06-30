import { B2BCommands, B2CCommands, MpesaConfig, ResponseType } from "./types";
export declare const useMpesa: (configs: MpesaConfig) => {
    stkPush: (phone: string | number, amount: number, reference?: string | number, description?: string, remark?: string) => Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    } | undefined>;
    registerUrls: (response_type?: ResponseType) => Promise<{
        data: null;
        error: any;
    } | {
        data: any;
        error: null;
    } | undefined>;
    simulateC2B: (phone: string | number, amount?: number, reference?: string | number, command?: string) => Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    } | undefined>;
    sendB2B: (receiver: string | number, receiver_type: string | number, amount: number, command?: B2BCommands, reference?: string | number, remarks?: string) => Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    } | undefined>;
    sendB2C: (phone: string | number, amount?: number, command?: B2CCommands, remarks?: string, occassion?: string) => Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    } | undefined>;
    checkBalance: (command: string, remarks?: string) => Promise<{
        data: any;
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    } | undefined>;
    checkStatus: (transaction: string, command?: string, remarks?: string, occasion?: string) => Promise<{
        data: any;
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    } | undefined>;
    reverseTransaction: (transaction: string, amount: number, receiver: number, receiver_type?: number, remarks?: string, occasion?: string) => Promise<{
        data: any;
        error?: undefined;
    } | {
        error: any;
        data?: undefined;
    } | undefined>;
    validateTransaction: (ok: boolean) => Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    confirmTransaction: (ok: boolean) => Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    reconcileTransaction: (ok: boolean) => Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    processResults: (ok: boolean) => Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    processTimeout: (ok: boolean) => Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
};
