"use strict";

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var proc = require('child_process');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('mongodb-prebuilt');
var mongodb_logs = require('debug')('mongodb');
var os = require('os');
var emitter = new EventEmitter();

module.exports = {
    "bin_path": bin_path,
    "dist_path": dist_path,
    "active_version": active_version,
    "install": install,
    "start_server": start_server
};

var shutdown = function(e) {
    mongodb_logs("Shutting down");
    if (typeof e === "function") {
        throw e;
    }
};

//process.on('uncaughtException', shutdown);
process.on('exit', shutdown);

function start_server(opts, callback) {
    emitter.once('mongoStarted', callback);
    if (!opts) {
        opts = {};
    }

	if(! opts.args) {
		opts.args = {};
	}

	if(opts.args.fork === undefined) {
		opts.args.fork = true;
	}

	if (! opts.args.logpath) {
		var log_file = path.join(os.tmpdir(), 'mongodb-prebuilt-' + (new Date()).getTime() + '.log');
		debug('logpath is', log_file);
		opts.args.logpath = log_file;
	}
    var args = build_args(opts);

    var bpath = bin_path(opts.version);
    if (!bpath) {
		return install(opts.version, function(err) {
			if(err) {
				callback(err);
			} else {
            	bpath = bin_path(opts.version);
            	return start();
			}
		});
    } else {
        return start();
    }

    function start() {
        debug("spawn", bpath + "mongod", args.join(' '));
        var child = proc.spawnSync(bpath + "mongod", args);
		mongodb_logs(child.stdout.toString());
		mongodb_logs(child.stderr.toString());

		if(child.status !== 0) {
			// error
            if (opts.exit_callback) {
                opts.exit_callback(child.status);
            }
			callback(child.status);
			return child.status;
		}

		// need to catch child pid
		var child_pid_match = child.stdout.toString().match(/forked process:\s+(\d+)/i);
		var child_pid = child_pid_match[1];
        var killer = proc.spawn("node", [path.join(__dirname, "binjs", "mongokiller.js"), process.pid, child_pid], {
            stdio: 'ignore'
        });
        killer.unref();

        emitter.once('mongoShutdown', function() {
            child.kill('SIGTERM');
        });

        emitter.emit('mongoStarted');

        if (opts.auto_shutdown) {
            // override shutdown function with sigterm
            shutdown = function(e) {
                child.kill('SIGTERM');
                if (e) {
                    throw e;
                }
            };
        }

		return child.status;
    }
    return emitter;
}

function dir_exists(dir) {
    try {
        var stats = fs.lstatSync(dir);
        if (stats.isDirectory()) {
            return true;
        }
    } catch (e) {
        debug("error from lstat:", e);
        return false;
    }
}

function build_args(opts) {
    var args = [];
    if (!opts.args) return [];

    Object.keys(opts.args).forEach(function(mongo_key) {
        if (opts.args[mongo_key]) {
            args.push("--" + mongo_key);
            if (opts.args[mongo_key] !== true) {
                args.push(opts.args[mongo_key]);
            }
        }
    });
    return args;
}

function bin_path(version) {
    var dpath = dist_path();
    if (!version) {
        version = active_version();
    }

    var bpath = path.join(dpath, version, '/bin/');
    debug("bin path: %s", bpath);

    if (dir_exists(bpath)) {
        return bpath;
    } else {
        debug("version %s is not installed", version);
        return;
    }
}

function dist_path() {
    return fs.readFileSync(path.join(__dirname, 'dist_path.txt'), 'utf-8');
}

function active_version() {
    return fs.readFileSync(path.join(__dirname, 'active_version.txt'), 'utf-8');
}

function install(version, callback) {
    var bin_path = bin_path(version);
    if (dir_exists(bin_path)) {
        callback(false);
    } else {
		var install_out = child_process.spawnFileSync('./install.js', [version]);
        callback(!!install_out.status);
    }
}
