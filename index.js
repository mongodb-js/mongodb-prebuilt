var fs = require('fs')
var path = require('path');

module.exports = path.join(
	fs.readFileSync(path.join(__dirname, 'dist_path.txt'), 'utf-8'),
	fs.readFileSync(path.join(__dirname, 'active_version.txt'), 'utf-8'),
	'/bin/'
);