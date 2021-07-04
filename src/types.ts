export type MpesaConfig = {
    env: "sandbox" | "live",
    type: number,
    shortcode: number,
    store: number | null,
    key: string,
    secret: string,
    username: string,
    password: string,
    passkey: string,
    validationUrl: string,
    confirmationUrl: string,
    callbackUrl: string,
    timeoutUrl: string,
    resultUrl: string,
}

export type MpesaResponse = { data: any, error: any }
export type ResponseType = "Completed" | "Cancelled"
export type B2BCommands = "BusinessPayBill" | "BusinessBuyGoods" | "DisburseFundsToBusiness" | "BusinessToBusinessTransfer" | "MerchantToMerchantTransfer"
export type B2CCommands = "BusinessPayment" | "SalaryPayment" | "PromotionPayment"