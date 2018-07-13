let {MongodHelper} = require('./dist/mongod-helper');


let mongodHelper = new MongodHelper(["--dbpath", __dirname + '/data']);

mongodHelper.run().then((started) => {
	console.log('mongod is running');
}, (e) => {
	console.log('error starting', e);
});
