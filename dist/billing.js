"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillManager = void 0;
const mpesa_1 = require("./mpesa");
class BillManager extends mpesa_1.Mpesa {
    /**
     * @param email Official contact email address for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.
     * @param officialContact Official contact phone number for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.
     * @param sendReminders Enable or disable SMS payment reminders for invoices sent. A payment reminder is sent 7 days before the due date, 3 days before the due date and on the day the payment is due.(0 - Disable Reminders 1- Enable Reminders)
     * @param logo File with your organization logo. File| Required .png, .jpg file, Base64
     */
    async onboard(email, officialContact, logo, sendReminders = 1) {
        const response = await this.service.post("v1/billmanager-invoice/optin", {
            shortcode: this.config.shortcode,
            logo,
            email,
            officialContact,
            sendReminders,
            callbackUrl: this.config.billingUrl,
        });
        if (response.errorCode) {
            return { data: null, error: response };
        }
        else {
            return { data: response, error: null };
        }
    }
    async modify(email, officialContact, sendReminders = 1) {
        const response = await this.service.post("v1/billmanager-invoice/change-optin-details", {
            shortcode: this.config.shortcode,
            email,
            officialContact,
            sendReminders,
            callbackUrl: this.config.billingUrl,
        });
        if (response.errorCode) {
            return { data: null, error: response };
        }
        else {
            return { data: response, error: null };
        }
    }
    async sendInvoice(invoice) {
        const response = await this.service.post("v1/billmanager-invoice/single-invoicing", invoice);
        if (Number(response.rescode) == 200) {
            return { data: response, error: null };
        }
        else {
            return { data: null, error: response };
        }
    }
    async sendInvoices(invoices) {
        const response = await this.service.post("v1/billmanager-invoice/bulk-invoicing", invoices);
        if (Number(response.rescode) == 200) {
            return { data: response, error: null };
        }
        else {
            return { data: null, error: response };
        }
    }
    async reconcile(invoice, callback) {
        return callback(invoice)
            ? {
                resmsg: "Success",
                rescode: "200",
            }
            : {
                resmsg: "Failed",
                rescode: "400",
            };
    }
    async acknowledge(invoice) {
        const response = await this.service.post("v1/billmanager-invoice/reconciliation", invoice);
        if (Number(response.rescode) == 200) {
            return { data: response, error: null };
        }
        else {
            return { data: null, error: response };
        }
    }
    async changeInvoice(invoice) {
        const response = await this.service.post("v1/billmanager-invoice/change-invoice", invoice);
        if (Number(response.rescode) == 200) {
            return { data: response, error: null };
        }
        else {
            return { data: null, error: response };
        }
    }
    async cancelInvoice(externalReference) {
        const response = await this.service.post("v1/billmanager-invoice/cancel-single-invoice", { externalReference });
        if (Number(response.rescode) == 200) {
            return { data: response, error: null };
        }
        else {
            return { data: null, error: response };
        }
    }
    async cancelInvoices(invoices) {
        const response = await this.service.post("v1/billmanager-invoice/cancel-bulk-invoice", invoices);
        if (Number(response.rescode) == 200) {
            return { data: response, error: null };
        }
        else {
            return { data: null, error: response };
        }
    }
}
exports.BillManager = BillManager;
//# sourceMappingURL=billing.js.map