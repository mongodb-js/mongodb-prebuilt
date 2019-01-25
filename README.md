# mongodb-prebuilt


![badge](https://nodei.co/npm/mongodb-prebuilt.png?downloads=true)

Install [mongodb](https://github.com/mongodb/mongo) prebuilt binaries using npm. This module helps you easily install the `mongodb` without having to compile anything.

MongoDB is an open-source, document database designed for ease of development and scaling.

## Installation

Download and install the latest build of mongodb for your OS and add it to your projects `package.json` as a `dependency`:

```
npm install mongodb-prebuilt
```

`--global` to make MongoDB binaries accessible without additional configurations.

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

## CLI usage
The latest version of MongoDB is used by default for your OS and `~/.mongodb-prebuilt` for downloading MongoDB binary.
You can set desired version, download folder, architecture and platform through environment variables:
```
MONGODB_VERSION
MONGODB_DOWNLOADDIR
MONGODB_ARCH
MONGODB_PLATFORM
```
For example:
```
export MONGODB_DOWNLOADDIR='./' MONGODB_VERSION=3.4.10
mongod --port 27018 --dbpath ./mongodb --logpath /dev/stdout
```
## Programmatic usage

```javascript
let {MongodHelper} = require('mongodb-prebuilt');

let mongodHelper = new MongodHelper(['--port', "27018"]);

// OPTIONAL: to control what version of mongo you want to download

mongodHelper = new MongodHelper(['--port', "27018"], {
	version: 'x.x.x'
});

mongodHelper.run().then((started) => {
	console.log('mongod is running');
}, (e) => {
	console.log('error starting', e);
});

```

