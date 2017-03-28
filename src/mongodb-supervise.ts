const Debug: any = require('debug');
import {resolve as resolvePath} from 'path';
import {ChildProcess, spawn as spawnChild} from 'child_process';

export class MongoSupervise {
  command: string;
  parentPid: number;
  execPath: string;
  monitorChild: ChildProcess;
  platform: string;
  childPid: number;
  debug: any;
  
  constructor(childPid: number) {
    this.childPid = childPid;
    this.execPath = resolvePath(__dirname, 'bin');
    this.parentPid = process.pid;
    this.command = "mongo-supervise.js";   
    this.platform =  process.platform;   
    this.debug = Debug(`mongodb-prebuilt-MongoSupervice`);
  }
  
  getSuperviseCommand(): string {
    let killerCommand: string = resolvePath(this.execPath, this.command);
    this.debug(`getSuperviseCommand(): ${killerCommand}`);
    return killerCommand;
  }
  
  run(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      
          if ( this.isWindows() === true ) {
            this.runOnWindows();
          } else {
            this.runOnLinux();
          }


        this.monitorChild.on('close', (code) => {
          //console.log('close of monitor child', code);
          this.debug('Exiting child monitor process with code:', code);
        });

        resolve(true);

    });
  }
  
  isWindows(): boolean {
    let isWindows: boolean = this.platform === "win32";
    this.debug(`isWindows(): ${isWindows}`);
    return isWindows;
  }
  
  runOnWindows(): void {
    this.debug(`runOnWindows()`);
    let command: string = this.getSuperviseCommand();
    this.monitorChild = spawnChild(
    "cmd.exe", 
    [command, this.parentPid.toString(), this.childPid.toString()]); 
    
  }
  
  runOnLinux(): void {
    this.debug(`runOnLinux()`);
    let command: string = this.getSuperviseCommand();
    this.monitorChild = spawnChild(command, 
    [this.parentPid.toString(), this.childPid.toString()]); 
    
  }
}