import { Mpesa } from "./mpesa";
import { MpesaResponse } from "./types";

export class BillManager extends Mpesa {
	/**
	 * @param email Official contact email address for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.
	 * @param officialContact Official contact phone number for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.
	 * @param sendReminders Enable or disable SMS payment reminders for invoices sent. A payment reminder is sent 7 days before the due date, 3 days before the due date and on the day the payment is due.(0 - Disable Reminders 1- Enable Reminders)
	 * @param logo File with your organization logo. File| Required .png, .jpg file, Base64
	 */
	public async onboard(
		email: string,
		officialContact: string | number,
		logo: string,
		billingUrl: string,
		sendReminders = 1
	): Promise<MpesaResponse> {
		const response = await this.service.post(
			"v1/billmanager-invoice/optin",
			{
				shortcode: this.config.shortcode,
				logo,
				email,
				officialContact,
				sendReminders,
				callbackUrl: billingUrl,
			}
		);

		if (response.errorCode) {
			return { data: null, error: response };
		} else {
			return { data: response, error: null };
		}
	}

	public async modify(
		email: string,
		officialContact: string | number,
		billingUrl: string,
		sendReminders = 1
	): Promise<MpesaResponse> {
		const response = await this.service.post(
			"v1/billmanager-invoice/change-optin-details",
			{
				shortcode: this.config.shortcode,
				email,
				officialContact,
				sendReminders,
				callbackUrl: billingUrl,
			}
		);

		if (response.errorCode) {
			return { data: null, error: response };
		} else {
			return { data: response, error: null };
		}
	}

	public async sendInvoice(invoice: {
		externalReference: string;
		billedFullName: string;
		billedPhoneNumber: string;
		billedPeriod: string;
		invoiceName: string;
		dueDate: string;
		accountReference: string;
		amount: string;
	}): Promise<MpesaResponse> {
		const response = await this.service.post(
			"v1/billmanager-invoice/single-invoicing",
			invoice
		);

		if (Number(response.rescode) == 200) {
			return { data: response, error: null };
		} else {
			return { data: null, error: response };
		}
	}

	public async sendInvoices(
		invoices: {
			externalReference: string;
			billedFullName: string;
			billedPhoneNumber: string;
			billedPeriod: string;
			invoiceName: string;
			dueDate: string;
			accountReference: string;
			amount: string;
		}[]
	): Promise<MpesaResponse> {
		const response = await this.service.post(
			"v1/billmanager-invoice/bulk-invoicing",
			invoices
		);

		if (Number(response.rescode) == 200) {
			return { data: response, error: null };
		} else {
			return { data: null, error: response };
		}
	}

	public async reconcile(
		invoice: {
			paymentDate: string;
			paidAmount: string;
			accountReference: string;
			transactionId: string;
			phoneNumber: string;
			fullName: string;
			invoiceName: string;
			externalReference: string;
		},
		callback: Function
	): Promise<any> {
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

	public async acknowledge(invoice: {
		transactionId: string;
		paidAmount: string;
		phoneNumber: string;
		paymentDate: string;
		fullName: string;
		invoiceName: string;
		accountReference: string;
		externalName: string;
	}): Promise<MpesaResponse> {
		const response = await this.service.post(
			"v1/billmanager-invoice/reconciliation",
			invoice
		);

		if (Number(response.rescode) == 200) {
			return { data: response, error: null };
		} else {
			return { data: null, error: response };
		}
	}

	public async changeInvoice(invoice: {
		paymentDate: string;
		paidAmount: string;
		accountReference: string;
		transactionId: string;
		phoneNumber: string;
		fullName: string;
		invoiceName: string;
		externalReference: string;
	}) {
		const response = await this.service.post(
			"v1/billmanager-invoice/change-invoice",
			invoice
		);

		if (Number(response.rescode) == 200) {
			return { data: response, error: null };
		} else {
			return { data: null, error: response };
		}
	}

	public async cancelInvoice(externalReference: string) {
		const response = await this.service.post(
			"v1/billmanager-invoice/cancel-single-invoice",
			{ externalReference }
		);

		if (Number(response.rescode) == 200) {
			return { data: response, error: null };
		} else {
			return { data: null, error: response };
		}
	}

	public async cancelInvoices(invoices: [{ externalReference: string }]) {
		const response = await this.service.post(
			"v1/billmanager-invoice/cancel-bulk-invoice",
			invoices
		);

		if (Number(response.rescode) == 200) {
			return { data: response, error: null };
		} else {
			return { data: null, error: response };
		}
	}
}
