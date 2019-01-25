"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Debug = require('debug');
var path_1 = require("path");
var child_process_1 = require("child_process");
var mongodb_prebuilt_1 = require("./mongodb-prebuilt");
var mongodb_supervise_1 = require("./mongodb-supervise");
var MongoBins = /** @class */ (function () {
    function MongoBins(command, commandArguments, spawnOptions, downloadOptions) {
        if (commandArguments === void 0) { commandArguments = []; }
        if (spawnOptions === void 0) { spawnOptions = {}; }
        this.command = command;
        this.commandArguments = commandArguments;
        this.spawnOptions = spawnOptions;
        this.debug = Debug("mongodb-prebuilt-MongoBins");
        if (downloadOptions) {
            this.mongoDBPrebuilt = new mongodb_prebuilt_1.MongoDBPrebuilt(downloadOptions);
        }
        else {
            this.mongoDBPrebuilt = new mongodb_prebuilt_1.MongoDBPrebuilt();
        }
    }
    MongoBins.prototype.run = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.runCommand().then(function () {
                _this.mongoSupervice = new mongodb_supervise_1.MongoSupervise(_this.childProcess.pid);
                _this.mongoSupervice.run().then(function () {
                    // all good
                }, function (e) {
                    // didnt start
                    _this.debug("run() Supervise process didn't start: " + e);
                });
                resolve(true);
            }, function (e) {
                _this.debug("error executing command " + e);
                reject(e);
            });
        });
    };
    MongoBins.prototype.runCommand = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var getCommandPromise = _this.getCommand();
            var getCommandArgumentsPromise = _this.getCommandArguments();
            Promise.all([
                getCommandPromise,
                getCommandArgumentsPromise
            ]).then(function (promiseValues) {
                var command = promiseValues[0];
                var commandArguments = promiseValues[1];
                _this.childProcess = child_process_1.spawn(command, commandArguments, _this.spawnOptions);
                _this.childProcess.on('close', function () {
                    _this.mongoSupervice.monitorChild.kill();
                });
                resolve(true);
            });
        });
    };
    MongoBins.prototype.getCommand = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.mongoDBPrebuilt.getBinPath().then(function (binPath) {
                var command = path_1.resolve(binPath, _this.command);
                _this.debug("getCommand(): " + command);
                resolve(command);
            });
        });
    };
    MongoBins.prototype.getCommandArguments = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.commandArguments);
        });
    };
    return MongoBins;
}());
exports.MongoBins = MongoBins;
//# sourceMappingURL=/Users/alwyn/crashburn/mongodb-prebuilt/mongo-bins.js.map