import { MpesaConfig } from "./types";
export declare class Service {
    private http;
    /**
     * @var object config Configuration options
     */
    config: MpesaConfig;
    /**
     * Setup global configuration for classes
     * @var Array configs Formatted configuration options
     *
     * @return void
     */
    constructor(configs: MpesaConfig);
    /**
     * Fetch Token To Authenticate Requests
     *
     * @return string Access token
     */
    private authenticate;
    generateSecurityCredential(): Promise<string>;
    /**
     * Perform a GET request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var String credentials Formated Auth credentials
     *
     * @return string/bool
     */
    get(endpoint: string): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Perform a POST request to the M-PESA Daraja API
     * @var String endpoint Daraja API URL Endpoint
     * @var Array data Formated array of data to send
     *
     * @return string/bool
     */
    post(endpoint: string, payload: any): Promise<any>;
}
