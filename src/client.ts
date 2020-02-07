import Axios from 'axios';

import Auth from './auth';
import Database from './database'

import { SirixInfo, AuthData, DatabaseInfo } from './info'

export default class Sirix {
  constructor(username: string, password: string, sirixUri: string, callback: Function) {
    this.sirixInfo = { sirixUri, databaseInfo: [] };
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
    this.auth = new Auth({ username, password, clientId: 'sirix' }, this.sirixInfo, this.authData, callback);
  }
  public auth: Auth;
  private sirixInfo: SirixInfo;
  private authData: AuthData;
  /**
   * database
   */
  public database(db_name: string, db_type: string = null): Promise<Database> {
    const db = new Database(db_name, db_type, this.sirixInfo, this.authData);
    return db.ready().then(res => {
      if (res) {
        return db;
      }
      return null;
    });
  }
  /**
   * getInfo
   */
  public getInfo(): Promise<DatabaseInfo[]> {
    return Axios.get(this.sirixInfo.sirixUri,
      {
        params: { withResources: true },
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.authData.access_token}`
        }
      }).then(res => {
        if (res.status >= 400) {
          console.error(res.status, res.data);
          return null;
        }
        Object.assign(this.sirixInfo.databaseInfo, res.data);
        return this.sirixInfo.databaseInfo;    
      });
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