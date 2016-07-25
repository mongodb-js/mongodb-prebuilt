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
        return install(opts.version, function(err) {
            if (err) {
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
        var child = spawnSync(bpath + "mongod", args);
        mongodb_logs(child.stdout.toString());
        mongodb_logs(child.stderr.toString());

        // error
        if (child.status !== 0) {
            if (opts.exit_callback) {
                opts.exit_callback(child.status);
            }
            callback(child.status);
            return child.status;
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

        return child.status;
    }
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
        var spawn_opts = [];
        if (version) {
            spawn_opts.push('--version', version);
        }
        if (process.env.https_proxy) {
            spawn_opts.push('--https-proxy', process.env.https_proxy);
        }
        var install_out = child_process.spawnFileSync('./install.js', spawn_opts);
        callback(!!install_out.status);
    }
}
