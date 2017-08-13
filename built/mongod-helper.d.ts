/// <reference types="node" />
import { MongoBins } from './mongo-bins';
export declare class MongodHelper {
    mongoBin: MongoBins;
    debug: any;
    private resolveLink;
    private rejectLink;
    constructor(commandArguments?: string[]);
    run(): Promise<boolean>;
    closeHandler(code: number): void;
    stderrHandler(message: string | Buffer): void;
    stdoutHandler(message: string | Buffer): void;
    getMongodStartedExpressionWindows(): RegExp;
    getMongodStartedExpressionLinux(): RegExp;
    getMongodAlreadyRunningExpression(): RegExp;
    getMongodPermissionDeniedExpression(): RegExp;
    getMongodDataDirNotFounddExpression(): RegExp;
    getMongodShutdownMessageExpression(): RegExp;
}
