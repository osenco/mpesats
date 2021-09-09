import { useMpesa } from "../dist";

const { stkPush } = useMpesa({
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
	stkPush(254115911300, 10)
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
