const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");

module.exports.resolvePath = function(filename) {
	return path.isAbsolute(filename) ? filename : path.join(ROOT_DIR, filename);
};

module.exports.saveJson = function(json, filename) {
	try {
		const finalPath = module.exports.resolvePath(filename);
		fs.writeFileSync(finalPath, JSON.stringify(json, null, 2));
		return true;
	}
	catch(err) {
		return false;
	}
};

module.exports.openJson = function(filename) {
	const finalPath = module.exports.resolvePath(filename);
	const content = fs.readFileSync(finalPath).toString();
	const json = JSON.parse(content);

	return json;
};

module.exports.genHash = function(size) {
	return crypto.randomBytes(size).toString("hex");
};
