import { MongoDBDownload } from 'mongodb-download';
export declare class MongoDBPrebuilt {
    mongoDBDownload?: MongoDBDownload;
    private debug;
    private binPath;
    private options;
    constructor(mongoDBDownload?: MongoDBDownload);
    getHomeDirectory(): string;
    getBinPath(): Promise<string>;
    private resolveBinPath;
    private hasValidBinPath;
}
