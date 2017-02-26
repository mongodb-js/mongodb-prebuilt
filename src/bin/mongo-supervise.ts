#!/usr/bin/env node

/* 
    make sure every few seconds that parent is still alive
    and if it is dead, we will kill child too.
    this is to ensure that exits done via kill
    wont leave mongod around
*/

let parentPid: number = parseInt(process.argv[2]);
let childPid: number = parseInt(process.argv[3]);

setInterval(() => {
    try {
        process.kill(parentPid, 0);
    } catch(e) {
        try {
            process.kill(childPid);
        } catch(e) {
            // doesnt matter if it is dead
        }
        process.exit();
    }
}, 2000);
