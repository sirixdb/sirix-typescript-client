import Axios from 'axios';

import { contentType, updateData } from './utils';

export default class Database {
  constructor(private name: string, private type: string, private sirixInfo: SirixInfo, private authData: AuthData) {
    let db = sirixInfo.databaseInfo.filter(obj => obj.name === name);
    if (db.length > 0) {
      this.type = db[0].type;
    } else {
      this.create();
    }
  }
  /**
   * delete
   */
  public async delete(): Promise<boolean> {
    let res = await Axios.delete(`${this.sirixInfo.sirixUri}/${this.name}`,
      { headers: { Authorization: this.authData.access_token, 'Content-Type': contentType(this.type) } }
    );
    if (res.status !== 204) {
      console.error(res.status, res.data);
      return false;
    } else {

      return true;
    }
  }
  /**
   * resource
   */
  public resource() {

  }
  /**
   * getInfo
   */
  public async getInfo(): Promise<DatabaseInfo> {
    let res = await Axios.get(`this.sirixInfo.sirixUri/${this.name}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.authData.access_token}`
        }
      });
    if (res.status >= 400) {
      console.error(res.status, res.data);
      return null;
    }
    let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === name)[0];
    updateData(db, JSON.parse(res.data));
    return db;
  }
  private async create(): Promise<boolean> {
    let res = await Axios.put(`${this.sirixInfo.sirixUri}/${this.name}`, {},
      {
        headers:
          { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type) }
      })
    if (res.status === 201) {
      this.getInfo();
      return true;
    } else {
      console.error(res.status, res.data);
      return false;
    }
  }
}