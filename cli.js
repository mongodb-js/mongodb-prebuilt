'use strict';
var proc = require('child_process');
var path = require('path');

module.exports = function(exec_name) {
        var debug = require('debug')('mongodb-prebuilt:' + exec_name);
        var exec_path = require('./index').bin_path();
        var exec_bin = path.resolve(exec_path,  exec_name);

        debug("exec_path: %s", exec_bin);
        var child = proc.spawn(exec_bin, process.argv.slice(2), {stdio: 'inherit'});
        child.on('close', function (code) {
                process.exit(code);
        }); 

        var mongokiller = path.resolve(exec_path, '../../../binjs', 'mongokiller.js');
        debug("mongokiller:", mongokiller, process.pid, child.pid);

        var monitor_child;
        if (process.platform === "win32") {
                monitor_child = proc.spawn(
                        "cmd.exe", 
                        [mongokiller, process.pid, child.pid], 
                        {stdio: 'inherit', detached: false}
                ); 
        } else {
                monitor_child = proc.spawn(
                        mongokiller, 
                        [process.pid, child.pid], 
                        {stdio: 'inherit', detached: false}
                );  
        }
}
