"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongo_bins_1 = require("../mongo-bins");
function runCommand(command) {
    var downloadOpts = getDownloadOpts();
    var mongoBin = new mongo_bins_1.MongoBins(command, process.argv.slice(2), { stdio: 'inherit' }, downloadOpts);
    mongoBin.run()
        // .then(() => console.log(`${command} is now running`))
        .catch(function (error) { return console.error("unable to launch " + command, error); });
}
exports.runCommand = runCommand;
function getDownloadOpts() {
    var opts = {};
    setIfExists(opts, 'version');
    setIfExists(opts, 'downloadDir');
    setIfExists(opts, 'arch');
    setIfExists(opts, 'platform');
    return Object.keys(opts).length > 0 ? opts : undefined;
}
function setIfExists(obj, property) {
    var value = process.env['MONGODB_' + property.toUpperCase()];
    if (value) {
        obj[property] = value;
    }
}
//# sourceMappingURL=/Users/alwyn/crashburn/mongodb-prebuilt/bin/runCommandHelper.js.map