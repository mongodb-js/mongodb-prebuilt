var db = require('./');

var res = db.start_server({"version": "3.2.0"}, function(err, foo, bar) {
    if(!err) console.log('started', foo, bar);
});
console.log('done', res);
