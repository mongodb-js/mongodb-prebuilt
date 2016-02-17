"use strict";

var fs = require('fs');
var path = require('path');
var install = require('./install');
var proc = require('child_process');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('mongodb-prebuilt');
var mongodb_logs = require('debug')('mongodb');
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

process.on('uncaughtException', shutdown);
process.on('exit', shutdown);

function start_server(opts, callback) {
    emitter.once('mongoStarted', callback);
    if (!opts) {
        opts = {};
    }

    var args = build_args(opts);
    var bpath = bin_path(opts.version);
    if (!bpath) {
        install(opts.version, function(err) {
            if (err) {
                callback(err);
            } else {
                bpath = bin_path(opts.version);
                start();
            }
        });
    } else {
        start();
    }

    function start() {
        debug("spawn", bpath + "mongod", args.join(' '));
        var child = proc.spawn(bpath + "mongod", args);
        var killer = proc.spawn("node", [path.join(__dirname, "binjs", "mongokiller.js"), process.pid, child.pid], {
            stdio: 'ignore'
        });
        killer.unref();
        child.on('error', function(err) {
            debug('Failed to start child process.', err);
            callback(err);
        });

        child.on('close', function(code) {
            debug('child process exited with code ' + code);
            if (opts.exit_callback) {
                opts.exit_callback(code);
            }
        });

        emitter.once('mongoShutdown', function() {
            child.kill('SIGTERM');
        });

        // this type of redirect is causing uncaught exception even with try/catch
        // when process exits with non zero error code, even tho error handler
        // is registered
        //child.stderr.pipe(child.stdout);

        var started = 0;
        child.stdout.on('data', function(data) {
            if (opts.logs_callback) {
                opts.logs_callback(data);
            }
            if (!started) {
                // log message indicating succesful start
                if (/waiting for connections on port/.test(data.toString())) {
                    started = 1;
                    emitter.emit('mongoStarted');
                }
                if (/errno:48 Address already in use/.test(data.toString())) {
                    emitter.emit('mongoStarted', "EADDRINUSE");
                }
            }
            mongodb_logs(data.toString().slice(0, -1));
        });

        if (opts.auto_shutdown) {
            // override shutdown function with sigterm
            shutdown = function(e) {
                child.kill('SIGTERM');
                if (e) {
                    throw e;
                }
            };
        }
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
        callback(null);
    } else {
        install(version, function(err) {
            callback(err);
        });
    }
}