import { MongoDBDownload } from 'mongodb-download';
import { IMongoDBDownloadOpts } from './mongod-helper';
export declare class MongoDBPrebuilt {
    mongoDBDownload?: MongoDBDownload | IMongoDBDownloadOpts;
    private debug;
    private binPath;
    constructor(mongoDBDownload?: MongoDBDownload | IMongoDBDownloadOpts);
    getHomeDirectory(): string;
    getBinPath(): Promise<string>;
    private resolveBinPath;
    private hasValidBinPath;
}
