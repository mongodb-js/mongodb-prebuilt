#!/usr/bin/env node

"use strict";

var argv = require('yargs').argv;

(function() {
    var fs = require('fs');
    var os = require('os');
    var path = require('path');
    var Decompress = require('decompress');
    var download = require('mongodb-download');
    var debug = require('debug')('mongodb-prebuilt');
    var https_proxy_agent = require('https-proxy-agent');


    var LATEST_STABLE_RELEASE = "3.2.0";

    function install(opts, callback) {
        try {
            opts = opts || {};
            var version = opts.version || LATEST_STABLE_RELEASE;

            debug("installing version: %s", version);
            var download_opts = {
                version: version
            }
            if (opts.httpsProxy || process.env.npm_config_https_proxy) {
                var proxy_uri = process.env.npm_config_https_proxy || opts.httpsProxy;
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

            var archive_type;
            if (/\.zip$/.test(archive)) {
                archive_type = "zip";
            } else {
                archive_type = "targz";
            }
            debug("archive type selected %s", archive_type);

            var destPath = path.join(__dirname, 'dist', version);
            var decomp = new Decompress({
                mode: '755'
            })
              .src(archive)
              .dest(destPath)
              .use(Decompress[archive_type]({
                  strip: 1
              }));

            var out = decomp.run(function(err, files) {
                if (!err) {
                    debug('inside extract, run complete. Extracted to ' + destPath);
                }
                callback(err);
            });
        }
        catch (err) { callback(err); }
    }

    console.log('done');

    module.exports = install;

    if (!module.parent) {
        var mongodb_version = process.argv[2] || process.env.npm_config_mongo_version || null;
        install(mongodb_version, function(err) {
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
