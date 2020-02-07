import Axios from 'axios';

import { contentType, updateData } from './utils';

import { SirixInfo, AuthData, DatabaseInfo } from './info'

export default class Database {
  constructor(private name: string, private type: string, private sirixInfo: SirixInfo, private authData: AuthData) { }
  /**
   * ready
   */
  public ready(): Promise<boolean> {
    let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === name);
    if (db.length > 0) {
      this.type = db[0].type;
    } else {
      return this.create();
    }
  }
  /**
   * delete
   */
  public delete(): Promise<boolean> {
    return Axios.delete(`${this.sirixInfo.sirixUri}/${this.name}`,
      { headers: { Authorization: this.authData.access_token, 'Content-Type': contentType(this.type) } }
    )
    .then(res => {
      if (res.status !== 204) {
        console.error(res.status, res.data);
        return false;
      } else {
        this.getInfo();
        return true;
      }
    });
  }
  /**
   * resource
   */
  public resource() {

  }
  /**
   * getInfo
   */
  public getInfo(): Promise<DatabaseInfo> {
    return Axios.get(`this.sirixInfo.sirixUri/${this.name}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.authData.access_token}`
        }
      })
      .then(res => {
        if (res.status >= 400) {
          console.error(res.status, res.data);
          return null;
        }
        let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === name)[0];
        updateData(db, JSON.parse(res.data));
        return db;
      });
  }
  private create(): Promise<boolean> {
    return Axios.put(`${this.sirixInfo.sirixUri}/${this.name}`, {},
      {
        headers:
          { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type) }
      })
      .then(res => {
        if (res.status === 201) {
          this.getInfo();
          return true;
        } else {
          console.error(res.status, res.data);
          return false;
        }
      })
  }
}