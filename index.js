"use strict";

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var proc = require('child_process');
var spawnSync = require('spawn-sync');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('mongodb-prebuilt');
var mongodb_logs = require('debug')('mongodb');
var os = require('os');

module.exports = {
    "bin_path": bin_path,
    "dist_path": dist_path,
    "active_version": active_version,
    "install": install,
    "start_server": start_server,
    "shutdown": shutdown
};


// persist created child pid
var child_pid = 0;
var killer;

function shutdown (e) {
    if (child_pid !== 0) {
        debug('killing mongod process: %d', child_pid);
        process.removeListener('exit', shutdown);
        process.kill(child_pid);
        killer.kill();
    }
};

process.on('exit', shutdown);

function start_server(opts, callback) {
    try {
        if (!opts) {
            opts = {};
        }

        if (!opts.args) {
            opts.args = {};
        }

        if (opts.args.fork === undefined) {
            opts.args.fork = true;
        }

        if (!opts.args.logpath) {
            var log_file = path.join(os.tmpdir(), 'mongodb-prebuilt-' + (new Date()).getTime() + '.log');
            debug('logpath is', log_file);
            opts.args.logpath = log_file;
        }
        var args = build_args(opts);

        var bpath = bin_path(opts.version);
        if (!bpath) {
            debug('MongoDB version ' + opts.version + ' not installed. Installing now...')
            return install(opts.version, function(err) {
                if (err) {
                    debug('Failed to download MongoDB version ' + opts.version + ': ' + err.message);
                    callback(err);
                } else {
                    debug('Successfully installed MongoDB version ' + opts.version);
                    // Try again, now that MongoDB is installed
                    start_server(opts, callback);
                }
            });
        } else {
            start(callback);
        }
    }
    catch (err) {
        callback(err);
    }

    function start(callback) {
        try {
            debug("spawn", bpath + "mongod", args.join(' '));
            var child = spawnSync(bpath + "mongod", args);
            mongodb_logs(child.stdout.toString());
            mongodb_logs(child.stderr.toString());

            // error
            if (child.status !== 0) {
                if (opts.exit_callback) {
                    opts.exit_callback(child.status);
                }
                callback(child.status);
            }

            // need to catch child pid
            var child_pid_match = child.stdout.toString().match(/forked process:\s+(\d+)/i);
            child_pid = child_pid_match[1];

            // if mongod started, spawn killer
            if (child.status === 0) {
                debug('starting mongokiller.js, ppid:%d\tmongod pid:%d', process.pid, child_pid);
                killer = proc.spawn("node", [path.join(__dirname, "binjs", "mongokiller.js"), process.pid, child_pid], {
                    stdio: 'ignore',
                    detached: true
                });
                killer.unref();
            }

            callback(null, child.status);
        }
        catch (err) { callback(err); }
    }
}

function dir_exists(dir) {
    try {
        var stats = fs.lstatSync(dir);
        return stats.isDirectory();
    } catch (e) {
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
    var _install = require('./install');
    try {
        var bPath = bin_path(version);
        if (dir_exists(bPath)) {
            return callback(new Error('Unable to install version ' + version
              + ': directory already exists ' + bPath
            ));
        }

        _install({
            version: version,
            httpProxy: process.env.https_proxy
        }, callback);
    }
    catch (err) { callback(err); }
}
