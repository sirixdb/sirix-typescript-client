import Axios from "axios";

import { contentType, updateData } from './utils';
import Database from "./database";

export default class Resource {
  constructor(
    private dbName: string,
    private resourceName: string,
    private type: string,
    private sirixInfo: SirixInfo,
    private authData: AuthData,
    private parent: Database
  ) {
    let db = sirixInfo.databaseInfo.filter(obj => obj.name === name);
    if (db.length > 0) {
      this.type = db[0].type;
      if (name in db[0].resources) {
        this.exists = true;
      }
    }
  }
  private exists: boolean = false;
  private async create(): Promise<boolean> {
    ///TODO
    return null;
  }
  /**
   * read
   */
  public async read(nodeId: number | null, revision: Revision | [Revision, Revision], maxLevel: number | null = null) {
    if (!this.exists) {
      let created = await this.create();
      if (!created) {
        return null;
      }
    }
    /// TODO!!
  }
  /**
   * update
   */
  public async update(nodeId: number, data, insert) {
    ///TODO
  }
  /**
   * delete
   */
  public async delete(nodeId: number | null) {
    let params = {}
    if (nodeId !== null) {
      params['nodeId'] = nodeId;
    }
    let res = await Axios.delete(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      { params, headers: { Authorization: this.authData.access_token } }
    );
    if (res.status !== 204) {
      console.error(res.status, res.data);
      return false;
    } else {
      this.parent.getInfo()
      return true;
    }
  }
}