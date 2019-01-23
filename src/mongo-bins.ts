const Debug: any = require('debug');
import { resolve as resolvePath } from 'path';
import { SpawnOptions, ChildProcess, spawn as spawnChild } from 'child_process';
import { IMongoDBDownloadOptions } from 'mongodb-download';
import { MongoDBPrebuilt } from './mongodb-prebuilt';
import { MongoSupervise } from './mongodb-supervise';

export class MongoBins {
  debug: any;
  childProcess: ChildProcess;
  mongoSupervice: MongoSupervise;
  mongoDBPrebuilt: MongoDBPrebuilt;

  constructor(
    public command: string,
    public commandArguments: string[] = [],
    public spawnOptions: SpawnOptions = {},
    downloadOptions?: Partial<IMongoDBDownloadOptions>
  ) {

    this.debug = Debug(`mongodb-prebuilt-MongoBins`);

    if (downloadOptions) {
      this.mongoDBPrebuilt = new MongoDBPrebuilt(downloadOptions);
    } else {
      this.mongoDBPrebuilt = new MongoDBPrebuilt();
    }
  }

  run(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.runCommand().then(() => {
        this.mongoSupervice = new MongoSupervise(this.childProcess.pid);
        this.mongoSupervice.run().then(() => {
          // all good
        }, (e) => {
          // didnt start
          this.debug(`run() Supervise process didn't start: ${e}`);
        });
        resolve(true);
      }, (e) => {
        this.debug(`error executing command ${e}`);
        reject(e);
      });
    });
  }

  runCommand(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let getCommandPromise: Promise<string> = this.getCommand();
      let getCommandArgumentsPromise: Promise<string[]> = this.getCommandArguments();

      Promise.all([
        getCommandPromise,
        getCommandArgumentsPromise
      ]).then(promiseValues => {
        let command: string = promiseValues[0];
        let commandArguments: string[] = promiseValues[1];
        this.childProcess = spawnChild(command, commandArguments, this.spawnOptions);
        this.childProcess.on('close', () => {
          this.mongoSupervice.monitorChild.kill();
        });
        resolve(true);
      })

    });
  }

  getCommand(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.mongoDBPrebuilt.getBinPath().then(binPath => {
        let command: string = resolvePath(binPath, this.command);
        this.debug(`getCommand(): ${command}`);
        resolve(command);
      });
    });
  }

  getCommandArguments(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      resolve(this.commandArguments);
    });
  }

}
