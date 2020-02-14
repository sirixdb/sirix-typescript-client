import Axios from "axios";

import { contentType, Insert } from './utils';

import { SirixInfo, AuthData, Revision, ReadParams, Commit, MetaNode } from './info'

export default class Resource {
  constructor(
    private dbName: string,
    private resourceName: string,
    private type: string,
    private sirixInfo: SirixInfo,
    private authData: AuthData,
  ) {
    let db = sirixInfo.databaseInfo.filter(obj => obj.name === name);
    if (db.length > 0) {
      this.type = db[0].type;
    }
  }
  /**
   * create
   */
  public create(data: string): Promise<boolean> {
    return Axios.put(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${this.authData.access_token}`,
          'Content-Type': contentType(this.type),
          'Accept': contentType(this.type)
        }
      }
    ).then(res => {
      if (res.status !== 200) {
        console.error(res.status, res.data);
        return false;
      } else {
        let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === this.dbName)[0];
        db.resources.push(this.resourceName);
        return true;
      }
    });
  }
  /**
   * history
   */
  public history(): Promise<Commit[]> {
    return Axios.get(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}/history`,
      {
        headers: { Authorization: `Bearer ${this.authData.access_token}` }
      }
    ).then(res => {
      if (res.status !== 200) {
        console.error(res.status, res.data);
        return null;
      } else {
        return res.data["history"];
      }
    })
  }
  /**
   * read
   */
  public read(inputParams: {
    nodeId: number,
    revision: Revision | [Revision, Revision],
    maxLevel: number
  }): Promise<string | JSON> {
    const params = this.readParams(inputParams);
    return Axios.get(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      {
        params: params,
        headers: { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type) }
      }
    ).then(res => {
      if (res.status !== 200) {
        console.error(res.status, res.data);
        return null;
      } else {
        return res.data;
      }
    })
  }
  /**
   * readWithMetadata
   */
  public readWithMetadata(inputParams: {
    nodeId: number,
    revision: Revision | [Revision, Revision],
    maxLevel: number
  }): Promise<MetaNode> {
    const params = this.readParams(inputParams);
    params["withMetadata"] = true;
    return Axios.get(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      {
        params: params,
        headers: { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type) }
      }
    ).then(res => {
      if (res.status !== 200) {
        console.error(res.status, res.data);
        return null;
      } else {
        return res.data;
      }
    })
  }
  private readParams(inputParams: {
    nodeId: number,
    revision: Revision | [Revision, Revision],
    maxLevel: number
  }) {
    let {nodeId, revision, maxLevel} = {...inputParams};
    let params: ReadParams = {}
    if (nodeId) {
      params['nodeId'] = nodeId;
    }
    if (maxLevel) {
      params['maxLevel'] = maxLevel;
    }
    if (revision) {
      if (typeof revision === 'number') {
        params['revision'] = revision;
      } else if (revision instanceof Date) {
        params['revision-timestamp'] = revision.toISOString();
      } else if (typeof revision[0] === 'number' && typeof revision[1] === 'number') {
        params['start-revision'] = revision[0];
        params['end-revision'] = revision[1];
      } else if (revision[0] instanceof Date && revision[1] instanceof Date) {
        params['start-revision-timestamp'] = revision[0].toISOString();
        params['end-revision-timestamp'] = revision[1].toISOString();
      }
    }
    return params;
  }
  /**
   * updateById
   */
  public async updateById(nodeId: number, data: string, insert: Insert): Promise<boolean> {
    let params = { nodeId };
    let head = await Axios.head(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      {
        params, headers: {
          Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type)
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
  public async update(nodeId: number, ETag: string, data: string, insert: Insert): Promise<boolean> {
    let res = await Axios.post(
      `${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      data,
      {
        params: { nodeId, insert },
        headers: {
          Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type)
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
      params = { nodeId };
    }
    let res = await Axios.delete(`${this.sirixInfo.sirixUri}/${this.dbName}/${this.resourceName}`,
      { params, headers: { Authorization: `Bearer ${this.authData.access_token}` } }
    );
    if (res.status !== 204) {
      console.error(res.status, res.data);
      return false;
    } else {
      let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === this.dbName)[0];
      db.resources.splice(db.resources.findIndex(val => val === this.resourceName));
      return true;
    }
  }
}