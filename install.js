#!/usr/bin/env node

"use strict";

(function() {
  var fs = require('fs');
  var os = require('os');
  var path = require('path');
  var Decompress = require('decompress');
  var download = require('mongodb-download');
  var debug = require('debug')('mongodb-prebuilt');

  var LATEST_STABLE_RELEASE = "3.2.0";

  function install(version, callback) {
    if (!version) {
      version = process.env.npm_config_mongo_version || LATEST_STABLE_RELEASE;
    }
    debug("installing version: %s", version);
    // downloads if not cached
    download({
      version: version
    }, function(err, archive) {
      if (err) {
        return callback(err);
      }
      extractFile(archive, version, callback);
    });
  }

  function extractFile(archive, version, callback) {
    var dist_path = path.join(__dirname, './dist/');

    fs.writeFileSync(path.join(__dirname, 'active_version.txt'), version);
    fs.writeFile(path.join(__dirname, 'dist_path.txt'), dist_path, function(err) {
      if (err) {
        return callback(err);
      }
      var archive_type;
      if (/\.zip$/.test(archive)) {
        archive_type = "zip";
      } else {
        archive_type = "targz";
      }
      debug("archive type selected %s", archive_type);

      new Decompress({
          mode: '755'
        })
        .src(archive)
        .dest(path.join(__dirname, 'dist', version))
        .use(Decompress[archive_type]({
          strip: 1
        }))
        .run(function(err, files) {
          if (!err) {
            callback();
          } else {
            //debug(err);
          }

        });

    });
  }

  module.exports = install;

  if (!module.parent) {
    install(null, function(err) {
      if (err) {
        console.log('Error during installation:', err);
      } else {
        console.log('Done installing MongoDB');
      }
    });
  }

})();