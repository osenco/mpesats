import { Mpesa } from "../dist";

const mpesa = new Mpesa({
	env: "sandbox",
	type: 4,
	shortcode: 174379,
	store: 174379,
	key: "9v38Dtu5u2BpsITPmLcXNWGMsjZRWSTG",
	secret: "bclwIPkcRqw61yUt",
	username: "apitest",
	password: "",
	passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
	validationUrl: "https://shop.osen.co.ke/lipwa/validate",
	confirmationUrl: "https://shop.osen.co.ke/lipwa/confirm",
	callbackUrl: "https://shop.osen.co.ke/lipwa/reconcile",
	timeoutUrl: "https://shop.osen.co.ke/lipwa/timeout",
	resultUrl: "https://shop.osen.co.ke/lipwa/results",
});

try {
	mpesa
		.stkPush("0115911300", 10)
		.then(({ error, data }) => {
			if (data) {
				const {
					MerchantRequestID,
					CheckoutRequestID,
					ResponseCode,
					ResponseDescription,
					CustomerMessage,
				} = data;
				console.log(MerchantRequestID);
			}

			if (error) {
				const { errorCode, errorMessage } = error;
				console.log(errorCode, errorMessage);
			}
		})
		.catch((e: any) => {
			console.log(e);
		});
} catch (error) {
	console.log(error);
}

async () => {
	const {
		error: { errorCode, errorMessage },
		data: {
			MerchantRequestID,
			CheckoutRequestID,
			ResponseCode,
			ResponseDescription,
			CustomerMessage,
		},
	} = await mpesa.stkPush(
		254705459494,
		10,
		"ACCOUNT",
		"Transaction Description",
		"Remark"
	);
};

mpesa.registerUrls().then(({ error, data }) => {
	if (data) {
		const { ResponseCode, ResponseDescription } = data;
		console.log(ResponseDescription);
	}

	if (error) {
		const { errorCode, errorMessage } = error;
		console.log(errorCode, errorMessage);
	}
});

mpesa.sendB2C(254705459494, 10).then(({ error, data }) => {
	if (data) {
		const {
			ConversationID,
			OriginatorConversationID,
			ResponseCode,
			ResponseDescription,
		} = data;
		console.log(OriginatorConversationID);
	}

	if (error) {
		const { errorCode, errorMessage } = error;
		console.log(errorCode, errorMessage);
	}
});

mpesa
	.billing()
	.onboard(
		"hi@osen.co.ke",
		254705459494,
		"https://osen.co.ke/wp-content/uploads/2019/11/logo.png",
		1
	)
	.then(({ error, data }) => {})
	.catch((e) => {});
