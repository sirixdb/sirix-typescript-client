import Axios from "axios";

import { contentType } from './utils';
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
  private async create(data): Promise<boolean> {
    let res = await Axios.put(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      data,
      {
        headers: {
          Authorization: this.authData.access_token,
          'Content-Type': contentType(this.type),
          'Accept': contentType(this.type)
        }
      }
    );
    if (res.status !== 200) {
      console.error(res.status, res.data);
      return false;
    } else {
      this.parent.getInfo();
      return true;
    }
  }
  /**
   * read
   */
  public async read(
    nodeId: number | null,
    revision: Revision | [Revision, Revision] | null,
    maxLevel: number | null = null,
    withMetadata: boolean = false
  ): Promise<string> {
    if (!this.exists) {
      let created = await this.create(null);
      if (!created) {
        return null;
      }
    }
    let params = {}
    if (nodeId) {
      params['nodeId'] = nodeId;
    }
    if (maxLevel) {
      params['maxLevel'] = maxLevel;
    }
    if (withMetadata) {
      params['withMetadata'] = true;
    }
    if (revision) {
      if (typeof revision === 'number') {
        params['revision'] = revision;
      } else if (revision instanceof Date) {
        params['revision-timestamp'] = revision.toISOString();
      } else if (typeof revision[0] === 'number' || typeof revision[1] === 'number') {
        params['start-revision'] = revision[0];
        params['end-revision'] = revision[1];
      } else {
        params['start-revision-timestamp'] = revision[0].toISOString();
        params['end-revision-timestamp'] = revision[1].toISOString();
      }
    }
    let res = await Axios.get(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      {
        params: params,
        headers: { Authorization: this.authData.access_token, 'Content-Type': contentType(this.type) }
      }
    )
    if (res.status !== 200) {
      console.error(res.status, res.data);
      return null;
    } else {
      return res.data;
    }
  }
  /**
   * updateById
   */
  public async updateById(nodeId: number, data: string, insert): Promise<boolean> {
    let params = { nodeId };
    let head = await Axios.head(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      {
        params, headers: {
          Authorization: this.authData.access_token, 'Content-Type': contentType(this.type)
        }
      }
    )
    if (head.status !== 200) {
      console.log(head.status, head.data);
      return null;
    }
    let ETag = head.headers['ETag'];
    return await this.update(nodeId, ETag, data, insert);
  }
  /**
   * update
   */
  public async update(nodeId: number, ETag: string, data: string, insert): Promise<boolean> {
    let res = await Axios.post(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      data,
      {
        params: { nodeId, insert },
        headers: {
          Authorization: this.authData.access_token, 'Content-Type': contentType(this.type)
        }
      })
    if (res.status !== 201) {
      console.error(res.status, res.data);
      return false;
    }
    return true;
  }
  /**
   * delete
   */
  public async delete(nodeId: number | null): Promise<boolean> {
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