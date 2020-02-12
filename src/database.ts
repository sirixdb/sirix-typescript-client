import Axios from 'axios';

import { contentType } from './utils';

import { SirixInfo, AuthData, DatabaseInfo } from './info'

import Resource from './resource';

export default class Database {
  constructor(private name: string, private type: string, private sirixInfo: SirixInfo, private authData: AuthData) { }
  /**
   * ready
   */
  public ready(): Promise<boolean> {
    let db = this.sirixInfo.databaseInfo.filter(obj => obj.name === this.name);
    if (db.length > 0) {
      this.type = db[0].type;
      return Promise.resolve(true);
    } else {
      return this.create();
    }
  }
  /**
   * delete
   */
  public delete(): Promise<boolean> {
    return Axios.delete(`${this.sirixInfo.sirixUri}/${this.name}`,
      { headers: { Authorization: `Bearer ${this.authData.access_token}`, 'Content-Type': contentType(this.type) } }
    )
    .then(res => {
      if (res.status !== 204) {
        console.error(res.status, res.data);
        return false;
      } else {
        return this.getInfo().then(() => {
          return true;
        });
      }
    });
  }
  /**
   * resource
   */
  public resource(name: string): Resource {
    return new Resource(this.name, name, this.type, this.sirixInfo, this.authData);
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
        this.sirixInfo.databaseInfo.splice(0, this.sirixInfo.databaseInfo.length, ...res.data["databases"]);
        return this.sirixInfo.databaseInfo;
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
          return this.getInfo().then(() => {
            return true;
          });
        } else {
          console.error(res.status, res.data);
          return false;
        }
      })
  }
}