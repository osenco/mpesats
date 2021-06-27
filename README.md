# mpesats

Wrapper for Mpesa Daraja Api using typescript

``` javascript
npm intall --save @osenco/mpesats
yarn add @osenco/mpesats  
```

``` javascript
import { Mpesa } from '@osenco/mpesats'
```

``` javascript
let mpesa = new Mpesa(
    CONSUMER_KEY,
    CONSUMER_SECRET,
    SANDBOX_SHORT_CODE,
    'random password',
    CALLBACK_URL
)
```

``` javascript
let response = mpesa.stkPush({
     Amount: 1,
     PartyA: 254705459494,
     PhoneNumber: 254705459494,
     AccountReference: 'YOUR RANDOM REFERENCE CODE',
     TransactionDesc: 'description',
})
```  
