import Axios from 'axios';

import { contentType, updateData } from './utils';

export default class Database {
  constructor(private name: string, private type: string, private sirixInfo: SirixInfo, private authData: AuthData) {
    let db = sirixInfo.databaseInfo.filter(obj => obj.name === name);
    if (db.length > 0) {
      this.type = db[0].type;
      this.exists = true;
    }
  }
  public exists: boolean = false;
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
  private async create(): Promise<boolean> {
    let res = await Axios.put(`${this.sirixInfo.sirixUri}/${this.name}`, {},
      {
        headers:
          { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type) }
      })
    if (res.status === 201) {
      updateData(res.data, this.sirixInfo.databaseInfo);
      return true;
    } else {
      console.error(res.status, res.data);
      return false;
    }
  }
}