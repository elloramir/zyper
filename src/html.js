const jsdom = require("jsdom");
const utils = require("./utils");

const ignoredTags = new Set([
	"script",
	"style",
	"canvas",
	"template",
	"iframe",
]);

module.exports.loadDocument = async function(url) {
	console.debug(`Parsing web page: ${url}`);
	const content = await fetch(url)
		.then(resp => resp.text())
		.catch(err => null);

	if (!content) {
		return null;
	}

	const dom = new jsdom.JSDOM(content, { url });
	const document = dom.window.document;

	return document;
};

module.exports.encodeHTML = function encodeHTML(domElement, parent, mapper) {
	if (!parent) {
		console.debug("Mapping text nodes into hash indices");
	}

	const elementName = domElement?.tagName?.toLowerCase();
	const hashId = utils.genHash(4);

	// Accepts Text Elements
	if (domElement.nodeType == 3) {
		const content = domElement.textContent.trim();
		if (!content.length) {
			return "";
		}

		// Saving it into a hashmap to retrive it later
		mapper.set(hashId, {
			textNode: domElement,
			parent: parent,
		});

		return `<text content="${content}" hash="${hashId}">`;
	}

	// Ignore scripts because most of the time it
	// just gibbersh our text content.
	if (ignoredTags.has(elementName)) {
		return "";
	}

	// Recursive encoder
	let result = "";
	for (const childElement of domElement.childNodes) {
		result += module.exports.encodeHTML(childElement, domElement, mapper);
	}

	return result;
};

module.exports.convertMapperHashToQuery = function(mapper, hash) {
	if (!mapper.has(hash)) return null;

	// Get DOM node tree until root
	const { parent } = mapper.get(hash);
	let node = parent;
	const parts = [];
	while (node && node.nodeType === 1) {
		let selector = node.tagName.toLowerCase();

		// Append id (if have some)
		if (node.id) {
			selector += `#${node.id}`;
			parts.unshift(selector);
			break;
		}

		// Add classes (if have some as well)
		if (node.className) {
		  const classes = node.className
			.split(/\s+/)
			.filter(Boolean)
			.join(".");
		  if (classes) selector += `.${classes}`;
		}

		// Add position to disambiguate
		const siblings = Array.from(node.parentNode?.children || []);
		const index = siblings.indexOf(node) + 1;
		selector += `:nth-child(${index})`;

		parts.unshift(selector);
		node = node.parentNode;
	}

	return parts.join(" > ");
};
