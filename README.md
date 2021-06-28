# M-Pesa TypeScript SDK

This is a simple wrapper for Mpesa Daraja Api using typescript

``` javascript
npm intall --save @osenco/mpesa
yarn add @osenco/mpesa
```

``` javascript
import { Mpesa } from '@osenco/mpesa'
```

``` javascript
const mpesa = new Mpesa(
    {
        env //"sandbox",
        type //4,
        shortcode //"174379",
        headoffice //"174379",
        key //"9v38Dtu5u2BpsITPmLcXNWGMsjZRWSTG",
        secret //"bclwIPkcRqw61yUt",
        username //"apitest",
        password //"",
        passkey //"bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
        validationUrl //"/lipwa/validate",
        confirmationUrl //"/lipwa/confirm",
        callbackUrl //"/lipwa/reconcile",
        timeoutUrl //"/lipwa/timeout",
        resultsUrl //"/lipwa/results",
    }
)
```

``` javascript
mpesa.stkPush(
    254705459494,
    10,
    "ACCOUNT",
    "Transaction Description",
    "Remark"
).then(({
    error,
    data
}) => {
    if (data) {
        const {
            MerchantRequestID,
            CheckoutRequestID,
            ResponseCode,
            ResponseDescription,
            CustomerMessage
        } = data
        console.log(MerchantRequestID)
    }

    if (error) {
        const { errorCode, errorMessage } = error
        console.log(errorCode, errorMessage);
    }
})
```
