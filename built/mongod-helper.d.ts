/// <reference types="node" />
import { MongoBins } from './mongo-bins';
export interface IMongoDBDownloadOpts {
    platform?: string;
    arch?: string;
    version?: string;
    downloadDir?: string;
    http?: any;
}
export declare class MongodHelper {
    mongoBin: MongoBins;
    debug: any;
    private resolveLink;
    private rejectLink;
    constructor(commandArguments?: string[], downloadOptions?: IMongoDBDownloadOpts);
    run(): Promise<boolean>;
    stop(): void;
    kill(): void;
    closeHandler(code: number): void;
    stderrHandler(message: string | Buffer): void;
    stdoutHandler(message: string | Buffer): void;
    getMongodStartedExpression(): RegExp;
    getMongodAlreadyRunningExpression(): RegExp;
    getMongodPermissionDeniedExpression(): RegExp;
    getMongodDataDirNotFounddExpression(): RegExp;
    getMongodShutdownMessageExpression(): RegExp;
}
