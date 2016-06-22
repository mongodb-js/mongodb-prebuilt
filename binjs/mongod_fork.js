#!/usr/bin/env node

/* 
    make sure every few seconds that parent is still alive
    and if it is dead, we will kill child too.
    this is to ensure that exits done via kill
    wont leave mongod around
*/

var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var os = require('os');
var uuid = require('node-uuid');
var debug = require('debug')('mongod-prebuilt');
var argv = require('yargs').argv;

var args = process.argv.splice(2);


var command = ['/c', 'start', '/b', 'node', path.join(__dirname, "mongod.js")];
command = command.concat(args);

debug('command', command);

var log = argv.logpath;

var mongod = child_process.spawn("cmd.exe", command, {
    detached: true,
    stdio: [ 'ignore']
});

mongod.unref();

setInterval(function() {
    try {
        var content = fs.readFileSync(log);
        if ( content.toString().match(/waiting for connections on port/i) ) {
            console.log('ok');
            process.abort(0);
        } else if ( content.toString().match(/dbexit/) ) {
            console.log('error');
            process.abort(1);
        }

    } catch(e) {
        console.log('unable to open', log, e);
    }
}, 500);


/*

var out_line = "";
mongod.stdout.on('data', function(data) {
    var str = data.toString();
    out_line += str;
    if ( str.match(/\n/) ) {
        //console.log("line:", out_line);
        if ( out_line.match(/waiting for connections on port/i) ) {
            console.log('connected');
        }
        out_line = "";
    }
});

var err_line = "";
mongod.stderr.on('data', function (data) {
    var str = data.toString();
    err_line += str;
    if ( str.match(/\n/) ) {
        console.log("error:", err_line);
        err_line = "";
    }});

mongod.on('close', function (code) {
  console.log("code", code);
});


mongod.unref();
*/