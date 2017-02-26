let {MongodHelper} = require('./built/mongod-helper');


let mongodHelper = new MongodHelper(['--port', "27018"]);

mongodHelper.run().then((started) => {
	console.log('mongod is running');
}, (e) => {
	console.log('error starting', e);
});
