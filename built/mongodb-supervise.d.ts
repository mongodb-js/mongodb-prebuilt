/// <reference types="node" />
import { ChildProcess } from 'child_process';
export declare class MongoSupervise {
    command: string;
    parentPid: number;
    execPath: string;
    monitorChild: ChildProcess;
    platform: string;
    childPid: number;
    debug: any;
    constructor(childPid: number);
    getSuperviseCommand(): string;
    run(): Promise<boolean>;
    isWindows(): boolean;
    runOnWindows(): void;
    runOnLinux(): void;
}
