#!/usr/bin/env node

"use strict";

var argv = require('yargs').argv;

(function() {
    var fs = require('fs-extra');
    var os = require('os');
    var path = require('path');
    var download = require('mongodb-download');
    var debug = require('debug')('mongodb-prebuilt');
    var https_proxy_agent = require('https-proxy-agent');
    var execSync = require('child_process').execSync;


    var LATEST_STABLE_RELEASE = "3.2.0";

    function install(opts, callback) {
        try {
            opts = opts || {};
            var version = opts.version || LATEST_STABLE_RELEASE;

            debug("installing version: %s", version);
            var download_opts = {
                version: version
            }
            if (opts.httpsProxy) {
                var proxy_uri = opts.httpsProxy;
                debug("using HTTP proxy for download:", proxy_uri);
                var proxy_agent = new https_proxy_agent(proxy_uri);
                download_opts.http_opts = {
                    agent: proxy_agent
                };
            }

            // downloads if not cached
            download(download_opts, function(err, archive) {
                if (err) {
                    return callback(err);
                }
                extractFile(archive, version, callback);
            });
        }
        catch (err) { callback(err); }
    }

    function extractFile(archive, version, callback) {
        try {
            var dist_path = path.join(__dirname, './dist/');

            fs.writeFileSync(path.join(__dirname, 'active_version.txt'), version);
            fs.writeFileSync(path.join(__dirname, 'dist_path.txt'), dist_path);

            var destPath = path.join(__dirname, 'dist', version);
            fs.ensureDirSync(destPath);

            debug('Extracting ' + archive + ' to ' + destPath + ' ...');
            try {
                execSync('tar -xf ' + archive + ' -C ' + destPath + ' --strip-components=1');
            }
            catch (err) {
                debug('Failed to extract MongoDB archive. Note that `mongodb-download`' +
                    ' does not throw or log errors, when it fails to download archives. ' +
                    'Instead, it creates an empty archive file, which cannot be extracted.' +
                    'Run install with `DEBUG=mongodb-download,mongodb-prebuilt`, to see a log ' +
                    'of where it is downloading the archive from, then make sure that version of MongoDB exists.')
                return callback(err);
            }
            debug('Extracted Files: ' + fs.readdirSync(destPath));

            callback();
        }
        catch (err) { callback(err); }
    }

    console.log('done');

    module.exports = install;

    if (!module.parent) {
        var mongodb_version = process.argv[2] || process.env.npm_config_mongo_version || null;
        install({
            version: mongodb_version,
            httpsProxy: process.env.npm_config_https_proxy
        }, function(err) {
            if (err) {
                console.error('Error during installation:', err);
                process.exit(1);
            } else {
                console.log('Done installing MongoDB');
                process.exit(0);
            }
        });
    }

})();
