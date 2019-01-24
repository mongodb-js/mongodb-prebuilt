import { MongoBins } from '../mongo-bins';
import { IMongoDBDownloadOptions } from 'mongodb-download';

export function runCommand(command: string) {
  const downloadOpts = getDownloadOpts();
  const mongoBin: MongoBins = new MongoBins(command, process.argv.slice(2), { stdio: 'inherit' }, downloadOpts);

  mongoBin.run()
    // .then(() => console.log(`${command} is now running`))
    .catch((error) => console.error(`unable to launch ${command}`, error));
}

function getDownloadOpts() : Partial<IMongoDBDownloadOptions> {
  const opts: Partial<IMongoDBDownloadOptions> = {};
  setIfExists(opts, 'version');
  setIfExists(opts, 'downloadDir');
  setIfExists(opts, 'arch');
  setIfExists(opts, 'platform');

  return Object.keys(opts).length > 0 ? opts : undefined;
}

function setIfExists(obj: Partial<IMongoDBDownloadOptions>, property: keyof IMongoDBDownloadOptions): void {
  const value = process.env['MONGODB_' + property.toUpperCase()];
  if (value) {
    obj[property] = value;
  }
}
