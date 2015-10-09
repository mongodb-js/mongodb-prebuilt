var db = require('./');

db.start_server({"version": "3.0.6"}, function(err) {
    if(!err) console.log('started');
});
