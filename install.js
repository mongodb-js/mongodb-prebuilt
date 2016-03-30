#!/usr/bin/env node

"use strict";

(function() {
  var fs = require('fs');
  var os = require('os');
  var path = require('path');
  var Decompress = require('decompress');
  var download = require('mongodb-download');
  var debug = require('debug')('mongodb-prebuilt');
  var HttpsProxyAgent = require('https-proxy-agent');
  var LATEST_STABLE_RELEASE = "3.2.0";

  function install(version, callback) {
    if (!version) {
      version = process.env.npm_config_mongo_version || LATEST_STABLE_RELEASE;
    }
    var params = {
      version: version
    };
    debug("installing version: %s", version);
    if(process.env.HTTPS_PROXY) {
      debug("setting proxy for request");
      params.http_opts = {};
      params.http_opts.agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
    }
    // downloads if not cached
    download(params, function(err, archive) {
      if (err) {
        return callback(err);
      }
      extractFile(archive, version, callback);
    });
  }

  function extractFile(archive, version, callback) {
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

    var decomp = new Decompress({
        mode: '755'
      })
      .src(archive)
      .dest(path.join(__dirname, 'dist', version))
      .use(Decompress[archive_type]({
        strip: 1
      }));

	var out = decomp.run(function(err, files) {
	  	console.log('inside extract, run complete');
        if (!err) {
          callback();
        } else {
          //debug(err);
        }
    });
  }

  console.log('done');

  module.exports = install;

  if (!module.parent) {
  	var mongodb_version = process.argv[2] || null;
    install(mongodb_version, function(err) {
      if (err) {
        console.log('Error during installation:', err);
      } else {
        console.log('Done installing MongoDB');
      }
    });
  }

})();
