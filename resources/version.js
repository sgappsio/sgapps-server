let version = '';

process.argv.forEach((arg, index) => {
	if (arg === '--version') {
		if (process.argv[index + 1]) {
			version = process.argv[index + 1];
		}
	}
});

if (!version) {
	process.stderr.write('\n\x1b[0;31;1;7m Version is not specified \x1b[0m\n\n');
	process.exit(1);
}

if (!version.match(/^(current|\d\.\d\.\d)$/)) {
	process.stderr.write(
		`\n\x1b[0;31;1;7m Version has not correct format [\x1b[0;33;1;7m${version}\x1b[0;31;1;7m] \x1b[0m\n\n`
	);
	process.exit(1);
}

const _fs = require('fs');

const content = _fs.readFileSync('package.json', 'utf8');

const currentVersion = (
	(
		content.match(/\"version\"\s*\:\s*\"(.*?)\"/) || []
	)[1] || ''
);

if (version === 'current') {
	process.stderr.write(
		`\n\x1b[0;33;1mVersion is unchanged [${currentVersion}]\x1b[0m\n\n`
	);
	process.exit(0);
} else {
	const contentUpdated = content.replace(
		/\"version\"\s*\:.*\n/,
		`"version": "${version}",\n`
	);

	_fs.writeFileSync(
		'package.json',
		contentUpdated
	);

	process.stderr.write(
		`\n\x1b[0;32;1mVersion updated [${currentVersion}] -> [${version}]\x1b[0m\n\n`
	);
	process.exit(0);
}
