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
npm install --mongodb-version=3.0.2 mongodb-prebuilt
```

## Programmatic usage

``` js
var mongodb_prebuilt = require('mongodb-prebuilt');

mongodb_prebuilt.start_server({
    version: "3.0.6" // optional, if not specified current active is used
}, function(err, db_response) {

});
```
