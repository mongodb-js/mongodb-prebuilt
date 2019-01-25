/// <reference types="node" />
import { SpawnOptions, ChildProcess } from 'child_process';
import { IMongoDBDownloadOptions } from 'mongodb-download';
import { MongoDBPrebuilt } from './mongodb-prebuilt';
import { MongoSupervise } from './mongodb-supervise';
export declare class MongoBins {
    command: string;
    commandArguments: string[];
    spawnOptions: SpawnOptions;
    debug: any;
    childProcess: ChildProcess;
    mongoSupervice: MongoSupervise;
    mongoDBPrebuilt: MongoDBPrebuilt;
    constructor(command: string, commandArguments?: string[], spawnOptions?: SpawnOptions, downloadOptions?: Partial<IMongoDBDownloadOptions>);
    run(): Promise<boolean>;
    runCommand(): Promise<boolean>;
    getCommand(): Promise<string>;
    getCommandArguments(): Promise<string[]>;
}
