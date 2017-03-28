#!/usr/bin/env node

import {MongoBins} from '../mongo-bins';
const COMMAND: string = "mongo";

let mongoBin: MongoBins = new MongoBins(COMMAND, process.argv.slice(2), {stdio: 'inherit'});
mongoBin.run().then(() => {
	//console.log(`${COMMAND} is now running`);
	console.log('command is running');
}, (e) => {
	console.error(`unable to launch ${COMMAND}`, e);
});