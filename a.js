var mdb = require('./index');

mdb.start_server({}, function(err) {
    console.log(err);
});
