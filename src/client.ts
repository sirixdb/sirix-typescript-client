import Axios from 'axios';

import Auth from './auth';
import Database from './database'

export default class Sirix {
  constructor(username, password, sirixUri) {
    this.sirixInfo.sirixUri = sirixUri;
    // initialize with null, so as to fit with the interface
    this.authData = {
      access_token: null,
      expires_in: null,
      refresh_expires_in: null,
      refresh_token: null,
      token_type: null,
      not_before_policy: null,
      session_state: null,
      scope: null
    }
    new Auth({ username, password, clientId: 'sirix' }, this.sirixInfo, this.authData);
  }
  private sirixInfo: SirixInfo;
  private authData: AuthData;
  /**
   * database
   */
  public async database(db_name: string, db_type: string = null): Promise<Database> {
    return new Database(db_name, db_type, this.sirixInfo, this.authData);
  }
  /**
   * getInfo
   */
  public async getInfo(): Promise<DatabaseInfo[]> {
    let res = await Axios.get(this.sirixInfo.sirixUri,
      {
        params: { withResources: true },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.authData.access_token}`
        }
      });
    if (res.status >= 400) {
      console.error(res.status, res.data);
      return null;
    }
    this.sirixInfo.databaseInfo = JSON.parse(res.data);
    return this.sirixInfo.databaseInfo;
  }
  /**
   * delete
   */
  public async delete(): Promise<boolean> {
    let res = await Axios.delete(this.sirixInfo.sirixUri,
      { headers: { Authorization: this.authData.access_token } });
    if (res.status >= 400) {
      console.error(res.status, res.data);
      return false;
    }
    await this.getInfo();
    return true;
  }
}