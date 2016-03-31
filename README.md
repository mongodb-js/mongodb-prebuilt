# mongodb-prebuilt


![badge](https://nodei.co/npm/mongodb-prebuilt.png?downloads=true)

Install [mongodb](https://github.com/mongodb/mongo) prebuilt binaries for command-line use using npm. This module helps you easily install the `mongodb` command for use on the command line without having to compile anything.

MongoDB is an open-source, document database designed for ease of development and scaling.

## Installation

Download and install the latest build of mongodb for your OS and add it to your projects `package.json` as a `devDependency`:

```
npm install mongodb-prebuilt --save-dev
```

You can also use the `-g` flag (global) to symlink it into your PATH:

```
npm install -g mongodb-prebuilt
```

If that command fails with an `EACCESS` error you may have to run it again with `sudo`:

```
sudo npm install -g mongodb-prebuilt
```

Now you can just run `mongod` to run mongodb:

```
mongod
```

Complete list of programs:

- [bsondump](https://docs.mongodb.org/manual/reference/program/bsondump/)
- [mongo](https://docs.mongodb.org/manual/reference/program/mongo/)
- [mongod](https://docs.mongodb.org/manual/reference/program/mongod/)
- [mongodump](https://docs.mongodb.org/manual/reference/program/mongodump/)
- [mongoexport](https://docs.mongodb.org/manual/reference/program/mongoexport/)
- [mongofiles](https://docs.mongodb.org/manual/reference/program/mongofiles/)
- [mongoimport](https://docs.mongodb.org/manual/reference/program/mongoimport/)
- [mongooplog](https://docs.mongodb.org/manual/reference/program/mongooplog/)
- [mongoperf](https://docs.mongodb.org/manual/reference/program/mongoperf/)
- [mongorestore](https://docs.mongodb.org/manual/reference/program/mongorestore/)
- [mongos](https://docs.mongodb.org/manual/reference/program/mongos/)
- [mongosniff](https://docs.mongodb.org/manual/reference/program/mongosniff/)
- [mongostat](https://docs.mongodb.org/manual/reference/program/mongostat/)
- [mongotop](https://docs.mongodb.org/manual/reference/program/mongotop/)

## About

Works on Mac, Windows, Linux and Solaris OSes that MongoDB supports.

The version numbers of this module DO NOT match the version number of the [offical MongoDB releases](https://www.mongodb.org/downloads#production). By default, latest production release will be selected. Different version is set via `mongodb-version`
option:

```
npm install --mongodb-version=3.2.0 mongodb-prebuilt
```

## Programmatic usage

``` js
var mongodb_prebuilt = require('mongodb-prebuilt');

mongodb_prebuilt.start_server({}, function(err) {
	if (err) {
		console.log('mongod didnt start:', err);
	} else {
		console.log('mongod is started');
	}
});
```

## start_server(opts, callback)

### opts
Type: `object`

Hash of `options`.

### callback(err)
Type: `function`

Function called when the `mongod` is started or returned an error

## Options

### version
Type: `string`

Optional version of MongoDB can be specified, if it doesn't match latest
version, and it is a first time you are running this version, mongodb-prebuilt
will have to go through the install process first.

```
mongodb_prebuilt.start_server({
	version: "3.2.0"
}, function(err) {
	if (!err) console.log('server started');
});
```

### args
Type: `function`

Optional arguments that are going to be passed to mongod, if argument doesn't
have a value, set that value to true. To see complete list of supported
arguments for your version run:
```
mongod --help
```

example of start_server with arguments
```
mongodb_prebuilt.start_server({
		args: {
			port: 27017,
			quiet: true
		}
})
```

### logs_callback(buffer)
Type: `function`

Optional logs handler.

```
mongodb_prebuilt.start_server({
	logs_callback: logs_callback
}, function(err) {});

function logs_callback(buffer) {
	console.log("log message:", buffer.toString());
}
```

### auto_shutdown
Type: `boolean`
Default: false

Will automatically shutdown the mongodb server when the parent process either exits or throws an uncaught exception

## Logging
To see logs in stdout, set environment variable DEBUG to `mongodb`

*nix
```
export DEBUG=mongodb
// without export
DEBUG=mongodb node myapp.js
```

windows
```
set DEBUG=mongodb
```

# Download Proxy
If you require proxy to reach outside networks, you may do it by:

* pass extra argument to npm install

```
npm install --https-proxy="https://example.com"
```

* set environment variable with https_proxy

```
# *nix
export https_proxy="https://example.com"
# win32
set https_proxy="https://example.com"
```

