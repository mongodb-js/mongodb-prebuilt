import { IMongoDBDownloadOptions, MongoDBDownload } from 'mongodb-download';
export declare class MongoDBPrebuilt {
    mongoDBDownload?: MongoDBDownload | Partial<IMongoDBDownloadOptions>;
    private debug;
    private binPath;
    constructor(mongoDBDownload?: MongoDBDownload | Partial<IMongoDBDownloadOptions>);
    getHomeDirectory(): string;
    getBinPath(): Promise<string>;
    private resolveBinPath;
    private hasValidBinPath;
}
