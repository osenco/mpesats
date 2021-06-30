export declare type MpesaConfig = {
    env: "sandbox" | "live";
    type: number;
    shortcode: number;
    store: number | null;
    key: string;
    secret: string;
    username: string;
    password: string;
    passkey: string;
    validationUrl: string;
    confirmationUrl: string;
    callbackUrl: string;
    timeoutUrl: string;
    resultUrl: string;
};
export declare type ResponseType = "Completed" | "Cancelled";
export declare type B2BCommands = "BusinessPayBill" | "BusinessBuyGoods" | "DisburseFundsToBusiness" | "BusinessToBusinessTransfer" | "MerchantToMerchantTransfer";
export declare type B2CCommands = "BusinessPayment" | "SalaryPayment" | "PromotionPayment";
