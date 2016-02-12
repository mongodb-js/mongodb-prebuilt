#!/usr/bin/env node

/* 
    make sure every few seconds that parent is still alive
    and if it is dead, we will kill child too.
    this is to ensure that exits done via kill
    wont leave mongod around
*/

setInterval(function() {
    try {
        process.kill(process.argv[2],0);
    } catch(e) {
        try {
            process.kill(process.argv[3]);
        } catch(e) {
            // doesnt matter if it is dead
        }
        process.exit();
    }
}, 2000);
