import { LoginInfo } from "./info";
export default class Client {
    private _client;
    init(loginInfo: LoginInfo, sirixUri: string): Promise<void>;
}
