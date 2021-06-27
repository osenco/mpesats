export declare type Payload = {
    Amount: string;
    PhoneNumber: string;
    AccountReference: string;
    TransactionDesc: string;
};
export declare type CallBack = {
    Body: {
        stkCallback: {
            MerchantRequestID: string;
            CheckoutRequestID: string;
            ResultCode: 0;
            ResultDesc: string;
            CallbackMetadata?: {
                Item: {
                    Name: string;
                    Value?: string;
                }[];
            };
        };
    };
};
export declare type StkPushPayload = {
    BusinessShortCode: string;
    Password: string;
    Timestamp: string;
    TransactionType: string;
    Amount: string;
    PartyA: string;
    PartyB: string;
    PhoneNumber: string;
    CallBackURL: string;
    AccountReference: string;
    TransactionDesc: string;
};
export declare type PaymentResponse = {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
};
export declare type C2BPayload = {
    CommandID: string;
    Amount: number;
    Msisdn: number;
    BillRefNumber: string | number;
    ShortCode: number;
};
export declare type C2BIpnPayload = {
    TransactionType: string;
    TransID: string;
    TransTime: number;
    TransAmount: number;
    BusinessShortCode: number;
    BillRefNumber: string | number | null;
    InvoiceNumber: string | null;
    OrgAccountBalance: string;
    ThirdPartyTransID: string;
    MSISDN: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
};
