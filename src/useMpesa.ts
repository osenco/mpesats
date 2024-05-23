import axios, { AxiosInstance } from "axios";
import { format } from "date-fns";
import { BillManager } from "./billing";
import { Service } from "./service";
import {
	MpesaResponse,
	MpesaSTKResponse,
	B2BCommands,
	B2CCommands,
	MpesaConfig,
	ResponseType,
} from "./types";

export const useMpesa = (configs: MpesaConfig, token: string | null = null) => {
	const ref = Math.random().toString(16).slice(2, 8).toUpperCase();

	/**
	 * Setup global configuration for classes
	 * @param MpesaConfig configs Formatted configuration options
	 *
	 * @return void
	 */
	const defaults: MpesaConfig = {
		env: "sandbox",
		type: 4,
		shortcode: 174379,
		store: 174379,
		key: "9v38Dtu5u2BpsITPmLcXNWGMsjZRWSTG",
		secret: "bclwIPkcRqw61yUt",
		username: "apitest",
		password: "",
		passkey:
			"bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
	};

	if (!configs || !configs.store || configs.type == 4) {
		configs.store = configs.shortcode;
	}

	const config = { ...defaults, ...configs };

	const service = new Service(config);

	if (token) {
		service.token = token;
	} else {
		service.authenticate();
	}

	const http: AxiosInstance = axios.create({
		baseURL:
			config.env == "live"
				? "https://api.safaricom.co.ke"
				: "https://sandbox.safaricom.co.ke",
		withCredentials: true,
	});

	http.defaults.headers.common = {
		Accept: "application/json",
		"Content-Type": "application/json",
	};

	function billManager(): BillManager {
		return new BillManager(configs);
	}

	/**
	 * @param phone The MSISDN sending the funds.
	 * @param amount The amount to be transacted.
	 * @param reference Used with M-Pesa PayBills.
	 * @param description A description of the transaction.
	 * @param remark Remarks
	 *
	 * @return Promise<MpesaResponse> Response
	 */
	async function stkPush(
		phone: string | number,
		Amount: number,
		AccountReference: string | number = ref,
		CallBackURL: string = "/lipwa/reconcile",
		TransactionDesc = "Transaction Description",
		Remark = "Remark"
	): Promise<MpesaResponse> {
		const PartyA = "254" + +String(phone).slice(-9);
		const Timestamp = format(new Date(), "yyyyMMddHHmmss");
		const Password = Buffer.from(
			config.shortcode + config.passkey + Timestamp
		).toString("base64");

		const response = await service.post("mpesa/stkpush/v1/processrequest", {
			BusinessShortCode: config.store,
			Password,
			Timestamp,
			TransactionType:
				Number(config.type) == 4
					? "CustomerPayBillOnline"
					: "CustomerBuyGoodsOnline",
			Amount,
			PartyA,
			PartyB: config.shortcode,
			PhoneNumber: PartyA,
			CallBackURL,
			AccountReference,
			TransactionDesc,
			Remark,
		});

		if (response.MerchantRequestID) {
			return { data: response, error: null };
		}

		if (response.errorCode) {
			return { data: null, error: response };
		}

		return response;
	}

	async function registerUrls(
		ConfirmationURL: string,
		ValidationURL: string,
		ResponseType: ResponseType = "Completed"
	): Promise<MpesaResponse> {
		const response = await service.post("mpesa/c2b/v1/registerurl", {
			ShortCode: config.store,
			ResponseType,
			ConfirmationURL,
			ValidationURL,
		});

		if (response.errorCode) {
			return { data: null, error: response };
		}

		if (response.MerchantRequestID) {
			return { data: response, error: null };
		}

		return response;
	}

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
	async function simulateC2B(
		phone: string | number,
		amount = 10,
		reference: string | number = "TRX",
		command = ""
	) {
		phone = phone;
		phone = "254" + +String(phone).slice(-9);

		const response = await service.post("mpesa/c2b/v1/simulate", {
			ShortCode: config.shortcode,
			CommandID: command,
			Amount: Number(amount),
			Msisdn: phone,
			BillRefNumber: reference,
		});

		if (response.MerchantRequestID) {
			return { data: response, error: null };
		}

		if (response.errorCode) {
			return { data: null, error: response };
		}
	}

	/**
	 * Transfer funds between two paybills
	 *
	 * @param receiver Receiving party phone
	 * @param amount Amount to transfer
	 * @param command Command ID
	 * @param occassion
	 * @param remarks
	 *
	 * @return Promise<any>
	 */
	async function sendB2C(
		phone: string | number,
		amount = 10,
		command: B2CCommands = "BusinessPayment",
		remarks = "",
		occassion = "",
		QueueTimeOutURL = "/lipwa/timeout",
		ResultURL = "/lipwa/result"
	): Promise<MpesaResponse> {
		phone = phone;
		phone = "254" + String(phone).slice(-9);

		const response = await service.post("mpesa/b2c/v1/paymentrequest", {
			InitiatorName: config.username,
			SecurityCredential: await service.generateSecurityCredential(),
			CommandID: command,
			Amount: Number(amount),
			PartyA: config.shortcode,
			PartyB: phone,
			Remarks: remarks,
			QueueTimeOutURL,
			ResultURL,
			Occasion: occassion,
		});

		if (response.OriginatorConversationID) {
			return { data: response, error: null };
		}

		if (response.ResultCode && response.ResultCode !== 0) {
			return {
				data: null,
				error: {
					errorCode: response.ResultCode,
					errorMessage: response.ResultDesc,
				},
			};
		}

		if (response.errorCode) {
			return { data: null, error: response };
		}

		return response;
	}

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
	async function sendB2B(
		receiver: string | number,
		receiver_type: string | number,
		amount: number,
		command: B2BCommands = "BusinessBuyGoods",
		reference: string | number = "TRX",
		remarks = "",
		QueueTimeOutURL = "/lipwa/timeout",
		ResultURL = "/lipwa/result"
	): Promise<MpesaResponse> {
		const response = await service.post("mpesa/b2b/v1/paymentrequest", {
			Initiator: config.username,
			SecurityCredential: await service.generateSecurityCredential(),
			CommandID: command,
			SenderIdentifierType: config.type,
			RecieverIdentifierType: receiver_type,
			Amount: amount,
			PartyA: config.shortcode,
			PartyB: receiver,
			AccountReference: reference,
			Remarks: remarks,
			QueueTimeOutURL,
			ResultURL,
		});

		if (response.MerchantRequestID) {
			return { data: response, error: null };
		}

		if (response.errorCode) {
			return { data: null, error: response };
		}

		return response;
	}

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
	async function checkStatus(
		transaction: string,
		command = "TransactionStatusQuery",
		QueueTimeOutURL: string = "/lipwa/timeout",
		ResultURL: string = "/lipwa/result",
		remarks = "Transaction Status Query",
		occasion = "Transaction Status Query"
	): Promise<MpesaResponse> {
		const response: MpesaSTKResponse = await service.post(
			"mpesa/transactionstatus/v1/query",
			{
				Initiator: config.username,
				SecurityCredential: await service.generateSecurityCredential(),
				CommandID: command,
				TransactionID: transaction,
				PartyA: config.shortcode,
				IdentifierType: config.type,
				ResultURL,
				QueueTimeOutURL,
				Remarks: remarks,
				Occasion: occasion,
			}
		);

		if (response.MerchantRequestID) {
			return { data: response, error: null };
		}

		if (response.errorCode) {
			return { data: null, error: response };
		}

		return { data: response, error: null };
	}

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
	async function reverseTransaction(
		TransactionID: string,
		Amount: number,
		ReceiverParty: number,
		RecieverIdentifierType = 3,
		QueueTimeOutURL: string = "/lipwa/timeout",
		ResultURL: string = "/lipwa/result",
		Remarks = "Transaction Reversal",
		Occasion = "Transaction Reversal"
	): Promise<MpesaResponse> {
		const response = await service.post("mpesa/reversal/v1/request", {
			CommandID: "TransactionReversal",
			Initiator: config.username,
			SecurityCredential: await service.generateSecurityCredential(),
			TransactionID,
			Amount,
			ReceiverParty,
			RecieverIdentifierType,
			ResultURL,
			QueueTimeOutURL,
			Remarks,
			Occasion,
		});

		if (response.MerchantRequestID) {
			return { data: response, error: null };
		}

		if (response.errorCode) {
			return { data: null, error: response };
		}

		return response;
	}

	/**
	 * Check Account Balance
	 *
	 * @param command
	 * @param remarks
	 * @param occassion
	 *
	 * @return Promise<any> Result
	 */
	async function checkBalance(
		CommandID: string,
		QueueTimeOutURL: string = "/lipwa/timeout",
		ResultURL: string = "/lipwa/result",
		Remarks = "Balance Query"
	): Promise<MpesaResponse> {
		const response = await service.post("mpesa/accountbalance/v1/query", {
			CommandID,
			Initiator: config.username,
			SecurityCredential: await service.generateSecurityCredential(),
			PartyA: config.shortcode,
			IdentifierType: config.type,
			Remarks,
			QueueTimeOutURL,
			ResultURL,
		});

		if (response.MerchantRequestID) {
			return { data: response, error: null };
		}

		if (response.errorCode) {
			return { data: null, error: response };
		}

		return response;
	}

	/**
	 * Validate Transaction Data
	 *
	 * @param callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	function validateTransaction(ok: boolean) {
		return ok
			? {
					ResultCode: 0,
					ResultDesc: "Success",
			  }
			: {
					ResultCode: 1,
					ResultDesc: "Failed",
			  };
	}

	/**
	 * Confirm Transaction Data
	 *
	 * @param callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	function confirmTransaction(ok: boolean, data: any, callback: Function) {
		if (callback) {
			ok = callback(data);
		}

		return ok
			? {
					ResultCode: 0,
					ResultDesc: "Success",
			  }
			: {
					ResultCode: 1,
					ResultDesc: "Failed",
			  };
	}

	/**
	 * Reconcile Transaction Using Instant Payment Notification from M-PESA
	 *
	 * @param callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	function reconcileTransaction(ok: boolean) {
		return ok
			? {
					ResultCode: 0,
					ResultDesc: "Service request successful",
			  }
			: {
					ResultCode: 1,
					ResultDesc: "Service request failed",
			  };
	}

	/**
	 * Process Results of an API Request
	 *
	 * @param callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	function processResults(ok: boolean) {
		return ok
			? {
					ResultCode: 0,
					ResultDesc: "Service request successful",
			  }
			: {
					ResultCode: 1,
					ResultDesc: "Service request failed",
			  };
	}

	/**
	 * Process Transaction Timeout
	 *
	 * @param callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	function processTimeout(callback: CallableFunction, ok: boolean) {
		return ok
			? {
					ResultCode: 0,
					ResultDesc: "Service request successful",
			  }
			: {
					ResultCode: 1,
					ResultDesc: "Service request failed",
			  };
	}

	return {
		billManager,
		stkPush,
		registerUrls,
		simulateC2B,
		sendB2B,
		sendB2C,
		checkBalance,
		checkStatus,
		reverseTransaction,
		validateTransaction,
		confirmTransaction,
		reconcileTransaction,
		processResults,
		processTimeout,
	};
};
