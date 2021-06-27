# mpesats

Wrapper for Mpesa Daraja Api using typescript

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
        key //"Your Consumer Key",
        secret //"Your Consumer Secret",
        username //"apitest",
        password //"",
        passkey //"bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
        validation_url //"/lipwa/validate",
        confirmation_url //"/lipwa/confirm",
        callback_url //"/lipwa/reconcile",
        timeout_url //"/lipwa/timeout",
        results_url //"/lipwa/results",
    }
)
```

``` javascript
const { error, data: {    
    MerchantRequestID: string,    
    CheckoutRequestID: string,    
    ResponseCode: string,    
    ResponseDescription: string,    
    CustomerMessage: string
    } 
} = mpesa.stkPush(
    phone //254705459494,
    amount //10,
    reference // "ACCOUNT",
    description // "Transaction Description",
    remark // "Remark"
)
```
