import { LoginInfo } from "./info";
import { AxiosPromise, AxiosRequestConfig } from "axios";
export declare type request = (config: AxiosRequestConfig) => AxiosPromise;
export declare type shutdown = () => void;
interface Auth {
    request: request;
    shutdown: shutdown;
}
export declare function initClient(loginInfo: LoginInfo, sirixUri: string): Promise<Auth>;
export {};
