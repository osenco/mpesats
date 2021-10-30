import axios, { AxiosInstance } from "axios";
import { format } from "date-fns";
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
	const ref = Math.random().toString(16).substr(2, 8).toUpperCase();

	/**
	 * Setup global configuration for classes
	 * @var MpesaConfig configs Formatted configuration options
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
		validationUrl: "/lipwa/validate",
		confirmationUrl: "/lipwa/confirm",
		callbackUrl: "/lipwa/reconcile",
		timeoutUrl: "/lipwa/timeout",
		resultUrl: "/lipwa/results",
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

	/**
	 * @var Integer phone The MSISDN sending the funds.
	 * @var Integer amount The amount to be transacted.
	 * @var String reference Used with M-Pesa PayBills.
	 * @var String description A description of the transaction.
	 * @var String remark Remarks
	 *
	 * @return Promise<MpesaResponse> Response
	 */
	async function stkPush(
		phone: string | number,
		amount: number,
		reference: string | number = ref,
		description = "Transaction Description",
		remark = "Remark"
	): Promise<MpesaResponse> {
		phone = String(phone);
		phone = "254" + phone.substr(phone.length - 9, phone.length);

		const timestamp = format(new Date(), "yyyyMMddHHmmss");
		const password = Buffer.from(
			config.shortcode + config.passkey + timestamp
		).toString("base64");

		const response = await service.post("mpesa/stkpush/v1/processrequest", {
			BusinessShortCode: config.store,
			Password: password,
			Timestamp: timestamp,
			TransactionType:
				Number(config.type) == 4
					? "CustomerPayBillOnline"
					: "CustomerBuyGoodsOnline",
			Amount: Number(amount),
			PartyA: phone,
			PartyB: config.shortcode,
			PhoneNumber: phone,
			CallBackURL: config.callbackUrl,
			AccountReference: reference,
			TransactionDesc: description,
			Remark: remark,
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
		response_type: ResponseType = "Completed"
	): Promise<MpesaResponse> {
		const response = await service.post("mpesa/c2b/v1/registerurl", {
			ShortCode: config.store,
			ResponseType: response_type,
			ConfirmationURL: config.confirmationUrl,
			ValidationURL: config.validationUrl,
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
	 * @var Integer phone Receiving party phone
	 * @var Integer amount Amount to transfer
	 * @var String command Command ID
	 * @var String reference
	 * @var Callable callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	async function simulateC2B(
		phone: string | number,
		amount = 10,
		reference: string | number = "TRX",
		command = ""
	) {
		phone = String(phone);
		phone = "254" + phone.substr(phone.length - 9, phone.length);

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
	 * @var receiver Receiving party phone
	 * @var amount Amount to transfer
	 * @var command Command ID
	 * @var occassion
	 * @var remarks
	 *
	 * @return Promise<any>
	 */
	async function sendB2C(
		phone: string | number,
		amount = 10,
		command: B2CCommands = "BusinessPayment",
		remarks = "",
		occassion = ""
	): Promise<MpesaResponse> {
		phone = String(phone);
		phone = "254" + phone.substr(phone.length - 9, phone.length);

		const response = await service.post("mpesa/b2c/v1/paymentrequest", {
			InitiatorName: config.username,
			SecurityCredential: await service.generateSecurityCredential(),
			CommandID: command,
			Amount: Number(amount),
			PartyA: config.shortcode,
			PartyB: phone,
			Remarks: remarks,
			QueueTimeOutURL: config.timeoutUrl,
			ResultURL: config.resultUrl,
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
	 * @var receiver Receiving party paybill
	 * @var receiver_type Receiver party type
	 * @var amount Amount to transfer
	 * @var command Command ID
	 * @var reference Account Reference mandatory for “BusinessPaybill” CommandID.
	 * @var remarks
	 *
	 * @return Promise<any>
	 */
	async function sendB2B(
		receiver: string | number,
		receiver_type: string | number,
		amount: number,
		command: B2BCommands = "BusinessBuyGoods",
		reference: string | number = "TRX",
		remarks = ""
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
			QueueTimeOutURL: config.timeoutUrl,
			ResultURL: config.resultUrl,
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
	 * @var String transaction
	 * @var String command
	 * @var String remarks
	 * @var String occassion
	 *
	 * @return Promise<any> Result
	 */
	async function checkStatus(
		transaction: string,
		command = "TransactionStatusQuery",
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
				ResultURL: config.resultUrl,
				QueueTimeOutURL: config.timeoutUrl,
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
	 * @var String transaction
	 * @var Integer amount
	 * @var Integer receiver
	 * @var String receiver_type
	 * @var String remarks
	 * @var String occassion
	 *
	 * @return Promise<any> Result
	 */
	async function reverseTransaction(
		transaction: string,
		amount: number,
		receiver: number,
		receiver_type = 3,
		remarks = "Transaction Reversal",
		occasion = "Transaction Reversal"
	): Promise<MpesaResponse> {
		const response = await service.post("mpesa/reversal/v1/request", {
			CommandID: "TransactionReversal",
			Initiator: config.username,
			SecurityCredential: await service.generateSecurityCredential(),
			TransactionID: transaction,
			Amount: amount,
			ReceiverParty: receiver,
			RecieverIdentifierType: receiver_type,
			ResultURL: config.resultUrl,
			QueueTimeOutURL: config.timeoutUrl,
			Remarks: remarks,
			Occasion: occasion,
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
	 * @var String command
	 * @var String remarks
	 * @var String occassion
	 *
	 * @return Promise<any> Result
	 */
	async function checkBalance(
		command: string,
		remarks = "Balance Query"
	): Promise<MpesaResponse> {
		const response = await service.post("mpesa/accountbalance/v1/query", {
			CommandID: command,
			Initiator: config.username,
			SecurityCredential: await service.generateSecurityCredential(),
			PartyA: config.shortcode,
			IdentifierType: config.type,
			Remarks: remarks,
			QueueTimeOutURL: config.timeoutUrl,
			ResultURL: config.resultUrl,
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
	 * @var Callable callback Defined function or closure to process data and return true/false
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
	 * @var Callable callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	function confirmTransaction(
		ok: boolean,
		data: any,
		callback: CallableFunction
	) {
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
	 * @var Callable callback Defined function or closure to process data and return true/false
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
	 * @var Callable callback Defined function or closure to process data and return true/false
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
	 * @var Callable callback Defined function or closure to process data and return true/false
	 *
	 * @return Promise<any>
	 */
	function processTimeout(ok: boolean) {
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
