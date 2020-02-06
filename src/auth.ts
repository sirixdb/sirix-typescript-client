import Axios from 'axios'

import { updateData } from './utils'
import { SirixInfo, LoginInfo, AuthData } from './info'

export default class Auth {
  constructor(private loginInfo: LoginInfo, private sirixInfo: SirixInfo, private authData: AuthData, public callback: Function) {
    this.authenticate().then(result => {
      if (result) {
        this.ready = true;
      } else {
        this.ready = false;
      }
    });
  }
  private timeout: number;
  public ready: boolean = null;
  public async authenticate() {
    let res = await Axios.post(`${this.sirixInfo.sirixUri}/token`,
      { username: this.loginInfo.username, password: this.loginInfo.password, grant_type: 'password' },
      { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.status >= 400) {
      console.error(res.status, res.data);
      return false;
    } else {
      updateData(JSON.parse(res.data), this.authData);
      this.setRefreshTimeout();
      return true;
    }
  }
  private setRefreshTimeout() {
    this.timeout = setTimeout(() => this.refresh(), this.authData.expires_in - 5);
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
      { refresh_token: this.authData.refresh_token, grant_type: 'refresh_token' },
      { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.status >= 400) {
      console.error(res.status, res.data);
      await this.callback();
      this.setRefreshTimeout();
    } else {
      let authData: AuthData = JSON.parse(res.data);
      updateData(authData, this.authData);
      this.setRefreshTimeout();
    }
  }
}
