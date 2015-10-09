var fs = require('fs')
var path = require('path');
var install = require('./install');
var proc = require('child_process');
var debug = require('debug')('mongodb-prebuilt');
var mongodb_logs = require('debug')('mongodb');

module.exports = {
	bin_path: function(version) {
		var dist_path = this.dist_path();
		if (!version) {
			version = this.active_version();
		} 

		var bin_path = path.join(dist_path, version, '/bin/');
		debug("bin path: %s", bin_path);

		if ( dir_exists(bin_path) ) {
			return bin_path;
		} else {
			debug("version %s is not installed", version);
			return;
		}
	},
	dist_path: function() {
		return fs.readFileSync(path.join(__dirname, 'dist_path.txt'), 'utf-8');
	},
	active_version: function() {
		return fs.readFileSync(path.join(__dirname, 'active_version.txt'), 'utf-8');
	},
	install: function(version, callback) {
		var bin_path = this.bin_path(version);
		if ( dir_exists(bin_path) ) {
			callback(null);
		} else {
			install(version, function(err) {
				callback(err);
			});
		}
	},
	start_server: function(opts, callback) {
		if (!opts) {
			opts = {};
		} 

		var args = build_args(opts);
		var child = proc.spawn(this.bin_path(opts.version) + "mongod", args);
		child.on('error', function (err) {
		  debug('Failed to start child process.', err);
		  callback(err);
		});
		child.on('close', function (code) {
			debug('child process exited with code ' + code);
			if ( opts.exit_callback ) {
				opts.exit_callback(code);
			}
		});
		child.stderr.pipe(child.stdout);

		var started = 0;
		child.stdout.on('data', function(data) {
			if ( opts.logs_callback ) {
				opts.logs_callback(data);
			}
			if (! started ) {
				// log message indicating succesful start
				if ( /waiting for connections on port/.test(data.toString())) {
					started = 1;
					callback();
				}
			}
			mongodb_logs(data.toString().slice(0, -1));
		});
	}
}

function dir_exists(dir) {
	console.log(dir);
	try {
	    var stats = fs.lstatSync(dir);
	    if (stats.isDirectory()) {
	    	return true;
	    }
	}
	catch (e) {
		debug("error from lstat:", e);
		return false;
	}	
}

function build_args(opts) {
	var args = [];
	if (!opts.args) return [];

	Object.keys(opts.args).forEach(function(mongo_key) {
		if ( opts.args[mongo_key] ) {
			args.push("--" + mongo_key);
			if ( opts.args[mongo_key] !== true ) {
				args.push(opts.args[mongo_key]);
			}
		}
	});
	return args;
}