#!/usr/bin/env node
var parentPid = parseInt(process.argv[2]);
var childPid = parseInt(process.argv[3]);
setInterval(function () {
    try {
        process.kill(parentPid, 0);
    }
    catch (e) {
        try {
            process.kill(childPid);
        }
        catch (e) {
            // doesnt matter if it is dead
        }
        process.exit();
    }
}, 2000);
//# sourceMappingURL=/Users/alwyn/crashburn/mongodb-prebuilt/bin/mongo-supervise.js.map