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
		child.on('error', function (err) {
		  debug('Failed to start child process.');
		});
		child.on('close', function (code) {
			debug('child process exited with code ' + code);
			if ( opts.exit_callback ) {
				opts.exit_callback(code);
			}
		});
		child.stderr.pipe(child.stdout);
		child.stdout.on('data', function(data) {
			if ( opts.logs_callback ) {
				opts.logs_callback(data);
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

function build_mongod_cli(opts) {
	var available_args = ["config", "port", "bind_ip", "ipv6", "maxConns", "logpath", 
	"syslog", "syslogFacility", "logappend", "logRotate", "timeStampFormat",
	"logappend", "logRotate", "timeStampFormat", "pidfilepath", "keyFile", "setParameter",
	"httpinterface", "clusterAuthMode", "nounixsocket", "unixSocketPrefix", "filePermissions",
	"fork", "auth", "noauth", "jsonp", "rest", "slowms", "profile", "cpu", "sysinfo", 
	"noIndexBuildRetry", "noscripting", "notablescan", "oplogSize", "master", "slave",
	"source", "only", "slavedelay", "autoresync", "replSet", "replIndexPrefetch", "configsvr",
	"shardsvr", "storageEngine", "dbpath", "directoryperdb", "noprealloc", "nssize",
	"quota", "quotaFiles", "smallfiles", "syncdelay", "upgrade", "repair", "repairpath",
	"journal", "nojournal", "journalOptions", "journalCommitInterval", "wiredTigerCacheSizeGB",
	"wiredTigerStatisticsLogDelaySecs", "wiredTigerJournalCompressor", 
	"wiredTigerDirectoryForIndexes", "wiredTigerCollectionBlockCompressor",
	"wiredTigerIndexPrefixCompression"];

	var args_string = "";
	available_args.forEach(function(mongo_key) {
		if ( opts[mongo_key] ) {
			var value = opts[mongo_key] === true ? "" : opts[mongo_key];
			args_string += " --" + mongo_key + " " + value;
		}
	});
	return args_string;
}