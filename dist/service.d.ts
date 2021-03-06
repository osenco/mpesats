import { AxiosResponse } from "axios";
import { MpesaConfig } from "./types";
export declare class Service {
    private http;
    token: string | null;
    /**
     * @param object config Configuration options
     */
    config: MpesaConfig;
    /**
     * Setup global configuration for classes
     * @param Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: MpesaConfig);
    /**
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */
    authenticate(token?: string | null): any;
    generateSecurityCredential(): Promise<string>;
    /**
     * Perform a GET request to the M-PESA Daraja API
     * @param endpoint Daraja API URL Endpoint
     * @param credentials Formated Auth credentials
     *
     * @return string/bool
     */
    get(endpoint: string): Promise<AxiosResponse<any, any>>;
    /**
     * Perform a POST request to the M-PESA Daraja API
     * @param endpoint Daraja API URL Endpoint
     * @param Array data Formated array of data to send
     *
     * @return string/bool
     */
    post(endpoint: string, payload: any): Promise<any>;
}
