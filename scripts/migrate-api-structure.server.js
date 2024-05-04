import fs from 'fs';

const EXCLUDE = [
	{
		name: 'requestType'
	},
	{
		name: 'loose'
	},
	{
		name: 'middlewares'
	},
	{
		name: 'endpointType',
		keepif: 'endpointType',
		keepifValue: "'form'"
	},
	{
		name: 'validation',
		keepif: 'public',
		keepifValue: 'true'
	},
	{
		name: 'public'
	}
];

const removeParam = (code, param, keepif = undefined, keepifValue = undefined) => {
	let after = 0;
	while (code.includes(param, after)) {
		const currentIndex = code.indexOf(param + ':', after - 1);
		let openCurly;
		let openSquare;

		if (keepif !== undefined) {
			let parentStartIndex = currentIndex;
			openCurly = 1;
			while (openCurly !== 0 && parentStartIndex > 0) {
				if (code[parentStartIndex] === '{') {
					openCurly = openCurly - 1;
				}
				if (code[parentStartIndex] === '}') {
					openCurly = openCurly + 1;
				}
				if (openCurly !== 0) {
					parentStartIndex = parentStartIndex - 1;
				}
			}

			let parentEndIndex = currentIndex;
			openCurly = 1;
			openSquare = 1;
			while (openCurly !== 0 && parentEndIndex > 0 && openSquare !== 0) {
				if (code[parentEndIndex] === '{') {
					openCurly = openCurly + 1;
				}
				if (code[parentEndIndex] === '}') {
					openCurly = openCurly - 1;
				}
				if (code[parentEndIndex] === '[') {
					openSquare = openSquare + 1;
				}
				if (code[parentEndIndex] === ']') {
					openSquare = openSquare - 1;
				}

				if (openCurly !== 0) {
					parentEndIndex = parentEndIndex + 1;
				}
			}

			const dependOnIndex = code.indexOf(keepif + ': ' + keepifValue, parentStartIndex - 1);
			const dependOnExists =
				dependOnIndex !== undefined && dependOnIndex >= 0 && dependOnIndex < parentEndIndex;
			if (dependOnExists) {
				after = parentEndIndex;
				continue;
			}
		}

		code = code.slice(0, currentIndex) + code.slice(currentIndex + param.length);

		let stringEnd = false;
		openCurly = 1;
		openSquare = 1;
		while (!stringEnd && code[currentIndex] !== undefined) {
			if (code[currentIndex] === ',' && openCurly === 1 && openSquare <= 1) {
				code = code.slice(0, currentIndex) + code.slice(currentIndex + 1);
				stringEnd = true;
			} else if (code[currentIndex] === '}' && openCurly === 1 && openSquare <= 1) {
				stringEnd = true;
			} else {
				if (code[currentIndex] === '{') {
					openCurly = openCurly + 1;
				}
				if (code[currentIndex] === '}') {
					openCurly = openCurly - 1;
				}
				if (code[currentIndex] === '[') {
					openSquare = openSquare + 1;
				}
				if (code[currentIndex] === ']') {
					openSquare = openSquare - 1;
				}
				code = code.slice(0, currentIndex) + code.slice(currentIndex + 1);
			}
		}
	}
	return code;
};

const removeEmptyObjects = (code) => {
	const regex = /(,(\s+)?)?[a-zA-Z]+:\s+\{\s+\}|[a-zA-Z]+:\s+\{\s+\}((\s+)?,)?/;

	while (code.match(regex)) {
		code = code.replace(regex, '');
	}

	while (code.match(/{\s*,/)) {
		code = code.replace(/{\s*,/, '{');
	}
	while (code.match(/,\s*,/)) {
		code = code.replace(/,\s*,/, ',');
	}
	while (code.match(/,\s*}/)) {
		code = code.replace(/,\s*}/, '}');
	}
	return code;
};

const cleanup = (code) => {
	return code
		.replaceAll('\n\t\t\t\n\t\t\t', '')
		.replaceAll('const apiStructure', 'const publicApiStructure')
		.replaceAll('ApiStructureStructure<typeof middlewareMap>', 'PublicApiStructureType')
		.replaceAll('ApiStructureStructure', 'PublicApiStructureType')
		.replaceAll(`import type { middlewareMap } from '$api/helpers/middleware.server';`, '');
};

const getFile = (path) => {
	return fs.readFileSync(path, 'utf8');
};

const saveFile = (code, outFile) => {
	fs.writeFileSync(outFile, code);
};

export default function main() {
	const INPUTFILE = process.argv[2];
	const OUTPUTFILE = process.argv[3];

	let code = getFile(INPUTFILE);
	for (const param of EXCLUDE) {
		code = removeParam(code, param.name, param?.keepif, param?.keepifValue);
	}

	code = removeEmptyObjects(code);
	code = cleanup(code);

	saveFile(code, OUTPUTFILE);
}

main();
