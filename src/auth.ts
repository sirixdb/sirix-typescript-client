import Axios from 'axios'

import { updateData } from './utils'
import { SirixInfo, LoginInfo, AuthData } from './info'

export default class Auth {
  constructor(private loginInfo: LoginInfo, private sirixInfo: SirixInfo, private authData: AuthData) {
    this.authenticate().then(() => {
      this.setRefreshTimeout();
    });
  }
  private async authenticate() {
    let res = await Axios.post(`${this.sirixInfo.sirixUri}/token`,
      { username: this.loginInfo.username, password: this.loginInfo.password, grant_type: 'password' },
      { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.status >= 400) {
      console.error(res.status, res.data);
    } else {
      updateData(JSON.parse(res.data), this.authData);
    }
  }
  private setRefreshTimeout() {
    setTimeout(() => this.refresh(), this.authData.expires_in - 5);
  }
  private async refresh() {
    let res = await Axios.post(`${this.sirixInfo.sirixUri}/token`,
      { refresh_token: this.authData.refresh_token, grant_type: 'refresh_token' },
      { headers: { 'Content-Type': 'multipart/form-data' } });
    if (res.status >= 400) {
      console.error(res.status, res.data);
      // TODO make this configurable
      await this.authenticate();
      this.setRefreshTimeout();
    } else {
      let authData: AuthData = JSON.parse(res.data);
      updateData(authData, this.authData);
      this.setRefreshTimeout();
    }
  }
}
