import fs from 'fs';
import 'dotenv/config';

const UTILSDIR = './prisma';
const INPUTFILE = UTILSDIR + '/schema.prisma';
const OUTPUTFILE = UTILSDIR + '/schema.prod.prisma';

const replaceDb = (code) => {
	const DATABASE_PROVIDER = process.env.DATABASE_PROVIDER;
	code = code.replace(
		/datasource\s+db\s+\{[^}]*\}/g,
		`datasource db {
		provider = "${DATABASE_PROVIDER}"
		url = env("DATABASE_URL")
	}`
	);

	code = code.replace(
		/client\s+db\s+\{[^}]*\}/g,
		`generator client {
		provider = "prisma-client-js"
		previewFeatures = ["driverAdapters"]
	}`
	);

	return code;
};

const getFile = (path) => {
	return fs.readFileSync(path, 'utf8');
};

const saveFile = (code) => {
	fs.writeFileSync(OUTPUTFILE, code);
};

export default function main() {
	let code = getFile(INPUTFILE);

	code = replaceDb(code);

	saveFile(code);
}

main();
