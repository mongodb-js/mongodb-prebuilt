var mdb = require('./index');

mdb.start_server({
	logs_callback: logs_callback, //optional
	exit_callback: exit_callback, //optional
}, function(err) {
    console.log(err);
});

function logs_callback(data) {
	// do any type of parsing
}

function exit_callback(exit_code) {
	// do something before terminating app
	console.log('exit code: ', exit_code);
}
