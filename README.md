# M-Pesa TypeScript SDK

This is a simple wrapper for Mpesa Daraja API using typescript

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
### Terms definitions
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
            <td>env</td>
            <td>Your API environment. Either `sandbox` or 'live'</td>
            <td>string</td>
        </tr>
        <tr>
            <td>type</td>
            <td>Identifier type 2 for Till, 2 for Paybill</td>
            <td>number</td>
        </tr>
        <tr>
            <td>store</td>
            <td>Store number if using a till number</td>
            <td>number</td>
        </tr>
        <tr>
            <td>shortcode</td>
            <td>Your Buy Goods number or Paybill</td>
            <td>number</td>
        </tr>
        <tr>
            <td>key</td>
            <td>App consumer key from Daraja</td>
            <td>string</td>
        </tr>
        <tr>
            <td>secret</td>
            <td>App consumer secret from Daraja</td>
            <td>string</td>
        </tr>
        <tr>
            <td>passkey</td>
            <td>Your online passkey</td>
            <td>string</td>
        </tr>
        <tr>
            <td>username</td>
            <td>Org portal username</td>
            <td>string</td>
        </tr>
        <tr>
            <td>password</td>
            <td>Org portal password</td>
            <td>string</td>
        </tr>
        <tr>
            <td>validationUrl</td>
            <td>A valid secure URL that is used to validate your transaction details</td>
            <td>string</td>
        </tr>
        <tr>
            <td>confirmationUrl</td>
            <td>
            A valid secure URL that is used to receive payment notifications from C2B API.</td>
            <td>string</td>
        </tr>
        <tr>
            <td>callbackUrl</td>
            <td>
            A valid secure URL that is used to receive payment notifications from M-Pesa API.</td>
            <td>string</td>
        </tr>
        <tr>
            <td>timeoutUrl</td>
            <td>
                This is the URL to be specified in your request that will be used by API Proxy to send notification incase the payment request is timed out while awaiting processing in the queue. 
            </td>
            <td>string</td>
        </tr>
        <tr>
            <td>resultsUrl</td>
            <td>
                This is the URL to be specified in your request that will be used by M-PESA to send notification upon processing of the payment request.
            </td>
            <td>string</td>
        </tr>
    </tbody>
</table>

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
        key // Your app consumer key,
        secret // Your app consumer secret,
        username // Your M-Pesa org username,
        password // Your M-Pesa org pass,
        passkey // Your online passkey "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
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
    "ACCOUNT", // You can ignore this, the code will generate a unique string
    "Transaction Description", // Optional
    "Remark" // optional
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

Or, if inside an async function

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

    console.log(MerchantRequestID)

    // TIP: Save MerchantRequestID and update when you receive the IPN
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
    "BusinessPayment" | "SalaryPayment" | "PromotionPayment", 
    "Some remark", 
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

        // TIP: Save `OriginatorConversationID` in the database, and use it as a key once you receive the IPN
    }

    if (error) {
        const { errorCode, errorMessage } = error
        console.log(errorCode, errorMessage);
    }
})
```

### Send B2B

``` javascript
mpesa.sendB2B(
    phone, 
    amount, 
    "BusinessPayBill" | "BusinessBuyGoods" | "DisburseFundsToBusiness" | "BusinessToBusinessTransfer" | "MerchantToMerchantTransfer", 
    "Some remark", 
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

        // TIP: Save `OriginatorConversationID` in the database, and use it as a key for update
    }

    if (error) {
        const { errorCode, errorMessage } = error
        console.log(errorCode, errorMessage);
    }
})
```
