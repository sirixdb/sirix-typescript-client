import Axios from 'axios'

import { SirixInfo, LoginInfo, AuthData } from './info'

export default class Auth {
  constructor(private loginInfo: LoginInfo, private sirixInfo: SirixInfo, private authData: AuthData, public callback: Function) {}
  private timeout: any;
  /**
   * authenticate
   */
  public authenticate() {
    return Axios.post(`${this.sirixInfo.sirixUri}/token`,
      { username: this.loginInfo.username, password: this.loginInfo.password, grant_type: 'password' })
      .then(res => {
        if (res.status >= 400) {
          console.error(res.status, res.data);
          return false;
        } else {
          Object.assign(this.authData, res.data);
          this.setRefreshTimeout();
          return true;
        }
      })
  }
  private setRefreshTimeout() {
    this.timeout = setTimeout(() => this.refresh(), (this.authData.expires_in - 5) * 1000);
  }
  /**
   * destroy
   */
  public destroy() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }
  private async refresh() {
    let res = await Axios.post(`${this.sirixInfo.sirixUri}/token`,
      { refresh_token: this.authData.refresh_token, grant_type: 'refresh_token' });
    if (res.status >= 400) {
      console.error(res.status, res.data);
      await this.callback();
      this.setRefreshTimeout();
    } else {
      Object.assign(this.authData, res.data);
      this.setRefreshTimeout();
    }
  }
}
