"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongo_bins_1 = require("./mongo-bins");
var Debug = require('debug');
var COMMAND = "mongod";
var MongodHelper = (function () {
    function MongodHelper(commandArguments) {
        if (commandArguments === void 0) { commandArguments = []; }
        this.resolveLink = function () { };
        this.rejectLink = function () { };
        this.mongoBin = new mongo_bins_1.MongoBins(COMMAND, commandArguments);
        this.debug = Debug("mongodb-prebuilt-MongodHelper");
    }
    MongodHelper.prototype.run = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.resolveLink = resolve;
            _this.rejectLink = reject;
            _this.mongoBin.run().then(function () {
                _this.mongoBin.childProcess.stderr.on('data', function (data) { return _this.stderrHandler(data); });
                _this.mongoBin.childProcess.stdout.on('data', function (data) { return _this.stdoutHandler(data); });
                _this.mongoBin.childProcess.on('close', function (code) { return _this.closeHandler(code); });
            });
        });
    };
    MongodHelper.prototype.closeHandler = function (code) {
        this.debug("mongod close: " + code);
    };
    MongodHelper.prototype.stderrHandler = function (message) {
        this.debug("mongod stderr: " + message);
    };
    MongodHelper.prototype.stdoutHandler = function (message) {
        this.debug("mongod stdout: " + message);
        var log = message.toString();
        var mongodStartExpressionWindows = this.getMongodStartedExpressionWindows();
        var mongodStartExpressionLinux = this.getMongodStartedExpressionLinux();
        var mongodAlreadyRunningExpression = this.getMongodAlreadyRunningExpression();
        var mongodPermissionDeniedExpression = this.getMongodPermissionDeniedExpression();
        var mongodDataDirNotFounddExpression = this.getMongodDataDirNotFounddExpression();
        var mongodShutdownMessageExpression = this.getMongodShutdownMessageExpression();
        if (mongodStartExpressionWindows.test(log) || mongodStartExpressionLinux.test(log)) {
            this.resolveLink(true);
        }
        if (mongodAlreadyRunningExpression.test(log)) {
            return this.rejectLink('already running');
        }
        if (mongodAlreadyRunningExpression.test(log)) {
            return this.rejectLink('already running');
        }
        if (mongodPermissionDeniedExpression.test(log)) {
            return this.rejectLink('permission denied');
        }
        if (mongodDataDirNotFounddExpression.test(log)) {
            return this.rejectLink('Data directory not found');
        }
        if (mongodShutdownMessageExpression.test(log)) {
            return this.rejectLink('Mongod shutting down');
        }
    };
    MongodHelper.prototype.getMongodStartedExpressionWindows = function () {
        return /waiting for connections on port/i;
    };
    MongodHelper.prototype.getMongodStartedExpressionLinux = function () {
        return /\[initandlisten\] setting featureCompatibilityVersion/i;
    };
    MongodHelper.prototype.getMongodAlreadyRunningExpression = function () {
        return /mongod instance already running/i;
    };
    MongodHelper.prototype.getMongodPermissionDeniedExpression = function () {
        return /permission denied/i;
    };
    MongodHelper.prototype.getMongodDataDirNotFounddExpression = function () {
        return /Data directory .*? not found/i;
    };
    MongodHelper.prototype.getMongodShutdownMessageExpression = function () {
        return /shutting down with code/i;
    };
    return MongodHelper;
}());
exports.MongodHelper = MongodHelper;
//# sourceMappingURL=/Users/winfinit/workspace/personal/mongodb-prebuilt/mongod-helper.js.map