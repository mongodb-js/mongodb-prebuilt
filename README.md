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

## About

Works on Mac, Windows, Linux and Solaris OSes that MongoDB supports.

The version numbers of this module match the version number of the [offical MongoDB releases](https://www.mongodb.org/downloads#production).


## Programmatic usage

``` js
var mongo_bin = require('mongodb-prebuilt');
var proc = require('child_process');

// spawn mongod
var child = proc.spawn(mongo_bin + "mongod");
```
