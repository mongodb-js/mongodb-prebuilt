#!/usr/bin/env node

// maintainer note - x.y.z-mongodb.3.0.4 version in package.json -> x.y.z

var LATEST_STABLE_RELEASE = "3.0.6";

var fs = require('fs')
var os = require('os')
var path = require('path')
var Decompress = require('decompress');
var download = require('mongodb-download');
var debug = require('debug')('mongodb-prebuilt');

var version = process.env.npm_config_mongo_version || LATEST_STABLE_RELEASE;
debug("installing version: %s", version);

function onerror (err) {
  throw err
}

var platform = os.platform();
var dist_path = path.join(__dirname, './dist/');
// downloads if not cached
download({version: version}, extractFile);

// unzips and makes path.txt point at the correct executable
function extractFile (err, archive) {
  if (err) return onerror(err)
  fs.writeFileSync(path.join(__dirname, 'active_version.txt'), version);
  fs.writeFile(path.join(__dirname, 'dist_path.txt'), dist_path, function (err) {
    if (err) return onerror(err)

    var archive_type;
    if ( platform === "win32" ) {
    	archive_type = "zip";
    } else {
    	archive_type = "targz";
    }
    debug("archive type selected %s", archive_type);

    new Decompress({mode: '755'})
	    .src(archive)
	    .dest(path.join(__dirname, 'dist', version))
	    .use(Decompress[archive_type]({strip: 1}))
	    .run(function(err, files) {
	    	if (err) return onerror(err);
	    });

  })
}