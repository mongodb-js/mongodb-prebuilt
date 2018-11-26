import {MongoBins} from './mongo-bins';
const Debug: any = require('debug');

const COMMAND: string = "mongod";

export class MongodHelper {
  mongoBin: MongoBins;
  debug: any;

  private resolveLink: (response: boolean) => void = () => {};
  private rejectLink: (response: string) => void = () => {};

  constructor(commandArguments: string[] = []) {
    this.mongoBin = new MongoBins(COMMAND, commandArguments);
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

  stop(): void {
    this.mongoBin.childProcess.kill('SIGINT')
  }

  kill(): void {
    this.mongoBin.childProcess.kill('SIGTERM')
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

    let mongodStartExpressionWindows: RegExp = this.getMongodStartedExpressionWindows();
    let mongodStartExpressionLinux: RegExp = this.getMongodStartedExpressionLinux();
    let mongodAlreadyRunningExpression: RegExp = this.getMongodAlreadyRunningExpression();
    let mongodPermissionDeniedExpression: RegExp = this.getMongodPermissionDeniedExpression();
    let mongodDataDirNotFounddExpression: RegExp = this.getMongodDataDirNotFounddExpression();
    let mongodShutdownMessageExpression: RegExp = this.getMongodShutdownMessageExpression();

    if ( mongodStartExpressionWindows.test(log) || mongodStartExpressionLinux.test(log) ) {
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

  getMongodStartedExpressionWindows(): RegExp {
    return /waiting for connections on port/i;
  }

  getMongodStartedExpressionLinux(): RegExp {
    return /\[initandlisten\] setting featureCompatibilityVersion/i;
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
