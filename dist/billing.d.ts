import { Mpesa } from "./mpesa";
import { MpesaResponse } from "./types";
export declare class BillManager extends Mpesa {
    /**
     * @param email Official contact email address for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.
     * @param officialContact Official contact phone number for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.
     * @param sendReminders Enable or disable SMS payment reminders for invoices sent. A payment reminder is sent 7 days before the due date, 3 days before the due date and on the day the payment is due.(0 - Disable Reminders 1- Enable Reminders)
     * @param logo File with your organization logo. File| Required .png, .jpg file, Base64
     */
    onboard(email: string, officialContact: string | number, logo: string, sendReminders?: number): Promise<MpesaResponse>;
    modify(email: string, officialContact: string | number, sendReminders?: number): Promise<MpesaResponse>;
    sendInvoice(invoice: {
        externalReference: string;
        billedFullName: string;
        billedPhoneNumber: string;
        billedPeriod: string;
        invoiceName: string;
        dueDate: string;
        accountReference: string;
        amount: string;
    }): Promise<MpesaResponse>;
    sendInvoices(invoices: {
        externalReference: string;
        billedFullName: string;
        billedPhoneNumber: string;
        billedPeriod: string;
        invoiceName: string;
        dueDate: string;
        accountReference: string;
        amount: string;
    }[]): Promise<MpesaResponse>;
    reconcile(invoice: {
        paymentDate: string;
        paidAmount: string;
        accountReference: string;
        transactionId: string;
        phoneNumber: string;
        fullName: string;
        invoiceName: string;
        externalReference: string;
    }, callback: Function): Promise<any>;
    acknowledge(invoice: {
        transactionId: string;
        paidAmount: string;
        phoneNumber: string;
        paymentDate: string;
        fullName: string;
        invoiceName: string;
        accountReference: string;
        externalName: string;
    }): Promise<MpesaResponse>;
    changeInvoice(invoice: {
        paymentDate: string;
        paidAmount: string;
        accountReference: string;
        transactionId: string;
        phoneNumber: string;
        fullName: string;
        invoiceName: string;
        externalReference: string;
    }): Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    }>;
    cancelInvoice(externalReference: string): Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    }>;
    cancelInvoices(invoices: [{
        externalReference: string;
    }]): Promise<{
        data: any;
        error: null;
    } | {
        data: null;
        error: any;
    }>;
}
