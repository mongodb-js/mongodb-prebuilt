'use strict';
var proc = require('child_process');

module.exports = function(exec_name) {
	var debug = require('debug')('mongodb-prebuilt:' + exec_name);
	var exec_path = require('./index').bin_path();
	exec_path += exec_name;

	debug("exec_path: %s", exec_path);
	var child = proc.spawn(exec_path, process.argv.slice(2), {stdio: 'inherit'});
		child.on('close', function (code) {
  		process.exit(code);
	})
}