var db = require('./');

db.start_server({"version": "3.2.0"}, function(err) {
    if(!err) console.log('started');
});
