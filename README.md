# M-Pesa TypeScript SDK

This is a simple wrapper for Mpesa Daraja Api using typescript

## Installation

### Via npm
``` javascript
npm install --save @osenco/mpesa
``` 

### Or yarn
``` javascript
yarn add @osenco/mpesa
```

## Usage
### Import
``` javascript
import { Mpesa } from '@osenco/mpesa'
```

### Instantiation
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
        resultUrl //"/lipwa/results",
    }
)
```

### Send an STK Push request
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

Or wrap it inside an async function

```javascript
async () => {
    const { error: { errorCode, errorMessage }, data: {
        MerchantRequestID,
        CheckoutRequestID,
        ResponseCode,
        ResponseDescription,
        CustomerMessage
    }
    } = await mpesa.stkPush(
        254705459494,
        10,
        "ACCOUNT",
        "Transaction Description",
        "Remark"
    )
}
```

### C2B register Callback URLs

``` javascript
mpesa.registerUrls().then(({
    error,
    data
}) => {
    if (data) {
        const {
            ResponseCode,
            ResponseDescription
        } = data
        console.log(ResponseDescription)
    }

    if (error) {
        const { errorCode, errorMessage } = error
        console.log(errorCode, errorMessage);
    }
})
```

### Send B2C

``` javascript
mpesa.sendB2C(
    phone, amount, command, remarks, occassion
).then(({
    error,
    data
}) => {
    if (data) {
        const {
            ConversationID,OriginatorConversationID,ResponseCode,ResponseDescription
        } = data
        console.log(OriginatorConversationID)
    }

    if (error) {
        const { errorCode, errorMessage } = error
        console.log(errorCode, errorMessage);
    }
})
```

TIP: Save `OriginatorConversationID` in the database, and use it as a key for update
