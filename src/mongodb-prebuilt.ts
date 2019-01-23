const Debug: any = require('debug');
const { Glob } = require("glob");
import { resolve as resolvePath } from 'path';
import { homedir as osHomeDir } from 'os';
import { IMongoDBDownloadOptions, MongoDBDownload } from 'mongodb-download';

export class MongoDBPrebuilt {
  private debug: any;
  private binPath: string;

  constructor(public mongoDBDownload?: MongoDBDownload | Partial<IMongoDBDownloadOptions>) {
    this.debug = Debug('mongodb-prebuilt-MongoDBPrebuilt');

    if (!this.mongoDBDownload || !(this.mongoDBDownload instanceof MongoDBDownload)) {
      const downloadOpts: Partial<IMongoDBDownloadOptions> = this.mongoDBDownload as Partial<IMongoDBDownloadOptions> || {
        downloadDir: this.getHomeDirectory()
      };
      downloadOpts.downloadDir = downloadOpts.downloadDir || this.getHomeDirectory();
      this.mongoDBDownload = new MongoDBDownload(downloadOpts);
    }
  }

  getHomeDirectory(): string {
    let homeDir: string = resolvePath(osHomeDir(), '.mongodb-prebuilt');
    this.debug(`getHomeDirectory(): ${homeDir}`);
    return homeDir;
  }

  getBinPath(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.binPath !== undefined) {
        this.debug(`getBinPath() cached: ${this.binPath}`);
        return resolve(this.binPath);
      }
      (<MongoDBDownload>this.mongoDBDownload).downloadAndExtract().then((extractLocation: string) => {
        this.resolveBinPath(extractLocation).then(binPath => {
          resolve(binPath);
        }, e => {
          reject(e);
        })
      })
    });
  }

  private resolveBinPath(extractLocation: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let binPath: string = `${extractLocation}/*/bin`;
      var mg = new Glob(binPath, {}, (err: any, files: string[]) => {
        if (err) {
          this.debug(`resolveBinPath() error ${err}`);
          reject(err);
        } else {
          if (this.hasValidBinPath(files) === true) {
            let resolvedBinPath: string = files[0];
            this.debug(`resolveBinPath(): ${resolvedBinPath}`);
            resolve(resolvedBinPath);
          } else {
            reject(`path not found`);
          }
        }
      });
    });
  }

  private hasValidBinPath(files: string[]): boolean {
    if (files.length === 1) {
      return true;
    } else if (files.length > 1) {
      this.debug(`getBinPath() directory corrupted, only one installation per hash can exist`);
      return false
    } else {
      this.debug(`getBinPath() doesn't exist, files: ${files}`);
      return false;
    }
  }

}
