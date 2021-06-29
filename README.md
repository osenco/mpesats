# M-Pesa TypeScript SDK

This is a simple wrapper for Mpesa Daraja Api using typescript

## Terms
<table>
    <thead>
        <tr>
            <th>Term</th>
            <th>Description</th>
            <th>Type</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>env</th>
            <td>Your API environment. Either `sandbox` or 'live'</td>
            <td>string</td>
        </tr>
        <tr>
            <th>type</th>
            <td>Identifier type 2 for Till, 2 for Paybill</td>
            <td>number</td>
        </tr>
        <tr>
            <th>store</th>
            <td>Store number if using a till number</td>
            <td>number</td>
        </tr>
        <tr>
            <th>shortcode</th>
            <td>Your Buy Goods number or Paybill</td>
            <td>number</td>
        </tr>
        <tr>
            <th>key</th>
            <td>App consumer key from Daraja</td>
            <td>string</td>
        </tr>
        <tr>
            <th>secret</th>
            <td>App consumer secret from Daraja</td>
            <td>string</td>
        </tr>
        <tr>
            <th>passkey</th>
            <td>Your online passkey</td>
            <td>string</td>
        </tr>
        <tr>
            <th>username</th>
            <td>Org portal username</td>
            <td>string</td>
        </tr>
        <tr>
            <th>password</th>
            <td>Org portal password</td>
            <td>string</td>
        </tr>
        <tr>
            <th>validationUrl</th>
            <td></td>
            <td>string</td>
        </tr>
        <tr>
            <th>confirmationUrl</th>
            <td></td>
            <td>string</td>
        </tr>
        <tr>
            <th>callbackUrl</th>
            <td>A CallBack URL is a valid secure URL that is used to receive notifications from M-Pesa API. It is the endpoint to which the results will be sent by M-Pesa API.</td>
            <td>string</td>
        </tr>
        <tr>
            <th>timeoutUrl</th>
            <td>
                This is the URL to be specified in your request that will be used by API Proxy to send notification incase the payment request is timed out while awaiting processing in the queue. 
            </td>
            <td>string</td>
        </tr>
        <tr>
            <th>resultsUrl</th>
            <td>
                This is the URL to be specified in your request that will be used by M-PESA to send notification upon processing of the payment request.
            </td>
            <td>string</td>
        </tr>
    </tbody>
</table>

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
### Import what you need
``` javascript
import { Mpesa } from "@osenco/mpesa"
```

### Instantiation
``` javascript
const mpesa = new Mpesa(
    {
        env //"sandbox",
        type //4,
        shortcode //174379,
        store //174379,
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

### Send an STK push request
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

### C2B register callback URLs

``` javascript
mpesa.registerUrls("Completed" | "Cancelled").then(({
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
    phone, 
    amount, 
    "BusinessPayment" | "SalaryPayment" | "PromotionPayment", "Some remark", 
    "Some occasion"
).then(({
    error,
    data
}) => {
    if (data) {
        const {
            ConversationID,
            OriginatorConversationID,
            ResponseCode,
            ResponseDescription
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
