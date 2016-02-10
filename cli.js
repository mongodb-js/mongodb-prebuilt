'use strict';
var proc = require('child_process');
var path = require('path');

module.exports = function(exec_name) {
	var debug = require('debug')('mongodb-prebuilt:' + exec_name);
	var exec_path = require('./index').bin_path();
	var exec_bin = exec_path + exec_name;

	debug("exec_path: %s", exec_bin);
	var child = proc.spawn(exec_bin, process.argv.slice(2), {stdio: 'inherit'});
		child.on('close', function (code) {
  		process.exit(code);
	});

	var monitor_child = proc.spawn(
		exec_path + "mongokiller", 
		[process.pid, child.pid], 
		{stdio: 'inherit', detached: false}
	);
}
