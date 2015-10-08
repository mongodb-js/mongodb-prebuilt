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
		var child = proc.spawn(this.bin_path(opts.version) + "mongod");
		child.stderr.pipe(child.stdout);
		child.stdout.on('data', function(data) {
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