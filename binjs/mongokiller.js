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
        process.kill(process.argv[3]);
        process.exit();
    }
}, 2000);
