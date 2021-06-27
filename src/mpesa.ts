import axios from 'axios';
import dotenv from 'dotenv'
import { Payload, PaymentResponse, LipaNaMpesaPayload } from './types'
import { format } from 'date-fns'

dotenv.config()

// eslint-disable-next-line max-len
const MPESA_SANDBOX_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const MPESA_URL = 'https://safaricom.co.ke/mpesa/stkpush/v1/processrequest';

// eslint-disable-next-line max-len
const MPESA_SANDBOX_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

export class Mpesa {
  private consumerKey: string
  private consumerSecret: string
  private BusinessShortCode: string;
  private Password: string;
  private CallBackURL: string;
  private Live: boolean

  constructor(
    consumerKey: string,
    consumerSecret: string,
    BusinessShortCode: string,
    Password: string,
    CallBackURL: string,
    Live: boolean
  ) {
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
    this.BusinessShortCode = BusinessShortCode;
    this.Password = Password;
    this.CallBackURL = CallBackURL;
    this.Live = Live
  }

  private async authenticate() {
    const auth = 'Basic ' + Buffer.from(
      this.consumerKey + ':' + this.consumerSecret,
    ).toString('base64');
    const config = { headers: { 'Authorization': auth } };
    const res = await axios.get(this.Live ? MPESA_AUTH_URL : MPESA_SANDBOX_AUTH_URL, config);
    return res.data.access_token;
  }

  async stkPush(payload: Payload): Promise<PaymentResponse> {
    try {
      const Timestamp = format(new Date(), 'yyyyMMddhhmmss');
      const password = Buffer.from(this.BusinessShortCode + this.Password + Timestamp)
        .toString('base64');

      const TransactionType: string = 'CustomerPayBillOnline';
      const ACCESS_TOKEN = await this.authenticate();
      const auth = 'Bearer ' + ACCESS_TOKEN;

      const data: LipaNaMpesaPayload = {
        BusinessShortCode: this.BusinessShortCode,
        Password: password,
        Timestamp,
        TransactionType,
        Amount: payload.Amount,
        PartyA: payload.PhoneNumber,
        PartyB: this.BusinessShortCode,
        PhoneNumber: payload.PhoneNumber,
        CallBackURL: this.CallBackURL,
        AccountReference: payload.AccountReference,
        TransactionDesc: payload.TransactionDesc,

      };

      return axios.post(
        this.Live ? MPESA_URL : MPESA_SANDBOX_URL,
        data,
        { headers: { 'Authorization': auth } },
      ).then(res => res.data).catch(err => err.response.data);

    } catch (e) {
      throw new Error(e.message)
    }
  }

}






