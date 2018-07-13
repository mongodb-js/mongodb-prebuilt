import {MongoBins} from './mongo-bins';
import {IMongoDBDownloadOptions} from "mongodb-download";

const Debug: any = require('debug');

const COMMAND: string = "mongod";

export class MongodHelper {
  mongoBin: MongoBins;
  debug: any;
  
  private resolveLink: (response: boolean) => void = () => {};
  private rejectLink: (response: string) => void = () => {};
  
  constructor(commandArguments: string[] = [], downloadOptions?: IMongoDBDownloadOptions) {
    this.mongoBin = new MongoBins(COMMAND, commandArguments, {download: downloadOptions});
    this.debug = Debug(`mongodb-prebuilt-MongodHelper`);
  }
  
  run(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.resolveLink = resolve;
      this.rejectLink = reject;
      
      this.mongoBin.run().then(() => {
        this.mongoBin.childProcess.stderr.on('data', (data) => this.stderrHandler(data));
        this.mongoBin.childProcess.stdout.on('data', (data) => this.stdoutHandler(data));
        this.mongoBin.childProcess.on('close', (code) => this.closeHandler(code));
      })
    })
  }

  closeHandler(code: number): void {
    this.debug(`mongod close: ${code}`);
  }

  stderrHandler(message: string | Buffer): void {
    this.debug(`mongod stderr: ${message}`);
  }
  
  stdoutHandler(message: string | Buffer): void {
    this.debug(`mongod stdout: ${message}`);
    let log: string = message.toString();

    let mongodStartExpression: RegExp = this.getMongodStartedExpression();
    let mongodAlreadyRunningExpression: RegExp = this.getMongodAlreadyRunningExpression();
    let mongodPermissionDeniedExpression: RegExp = this.getMongodPermissionDeniedExpression();
    let mongodDataDirNotFounddExpression: RegExp = this.getMongodDataDirNotFounddExpression();
    let mongodShutdownMessageExpression: RegExp = this.getMongodShutdownMessageExpression();
    
    if ( mongodStartExpression.test(log) ) {
      this.resolveLink(true);
    }

    if ( mongodAlreadyRunningExpression.test(log) ) {
      return this.rejectLink('already running');
    }

    if ( mongodAlreadyRunningExpression.test(log) ) {
      return this.rejectLink('already running');
    }

    if ( mongodPermissionDeniedExpression.test(log) ) {
      return this.rejectLink('permission denied');
    }

    if ( mongodDataDirNotFounddExpression.test(log) ) {
      return this.rejectLink('Data directory not found');
    }

    if ( mongodShutdownMessageExpression.test(log) ) {
      return this.rejectLink('Mongod shutting down');
    }

  }

  getMongodStartedExpression(): RegExp {
    return /waiting for connections on port/i;
  }

  getMongodAlreadyRunningExpression(): RegExp {
    return /mongod instance already running/i;
  }

  getMongodPermissionDeniedExpression(): RegExp {
    return /permission denied/i;
  }

  getMongodDataDirNotFounddExpression(): RegExp {
    return /Data directory .*? not found/i;
  }

  getMongodShutdownMessageExpression(): RegExp {
    return /shutting down with code/i;
  }

}
