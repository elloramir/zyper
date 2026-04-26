const html = require("./html");
const llm = require("./llm");

module.exports.createScrapeSchema = async function(descriptor) {
	const document = await html.loadDocument(descriptor.meta.url);
	const mapper = new Map();
	const encoded = html.encodeHTML(document.body, null, mapper);
	const dataResponse = await llm.askJson(`
		You are a web scraping schema extractor.
		
		Given the encoded HTML below, map each field from the schema to the correct text node.
		
		Schema to extract:
		${JSON.stringify(descriptor.api)}
		
		RULES - follow exactly:
		1. Return ONLY a JSON object where every key matches a field from the schema above.
		2. Each value MUST be an array with exactly 3 elements: [hash, regex, dataType]
		   - hash: the exact value of the "hash" attribute from the matching <text> tag
		   - regex: a JS-compatible regex string with one capture group, escaped for JSON
			 - integer  - "(\\d+)"
			 - float    - "(\\d+(?:\\.\\d+)?)"
			 - HH:MM    - "(\\d{2}:\\d{2})"
			 - string   - "(.+)"
		   - dataType: either "number" or "string"
		3. Do NOT return the extracted value itself - only the hash, regex, and dataType.
		4. Example output format:
		   { "temperature": ["a1b2c3d4", "(\\d+)", "number"] }
		
		Encoded HTML:
		${encoded}
	`);

	const fields = Object.keys(dataResponse);
	const finalSchema = {
		meta: {
			url: descriptor.meta.url,
		},
		api: { },
	};
	for (const fieldName of fields) {
		const [ hash, regex, dataType ] = dataResponse[fieldName];
		const query = html.convertMapperHashToQuery(mapper, hash);

		// Using final query to always find that element
		finalSchema.api[fieldName] = {
			query,
			regex,
			dataType,
		};
	}

	return finalSchema;
};

// It has sillent fails, because We just return
// the same input value in case of invalid regex pattern.
function applyPattern(value, pattern) {
	if (!pattern) return value;

	try {
		const regex = new RegExp(pattern);
		const match = value.match(regex);
		return match ? (match[1] || match[0]) : value;
	} catch {
		return value;
	}
}

function convertDataType(str, type) {
	switch (type) {
		case "number": return parseFloat(str);
		case "string": return String(str);
		default: return String(str);
	}
}

module.exports.scrapeSite = async function(schema) {
	const document = await html.loadDocument(schema.meta.url);
	const finalData = {};

	for (const key in schema.api) {
		const field = schema.api[key];
		const domElement = document.querySelector(field.query);

		const raw = domElement
		  ? domElement.textContent.trim()
		  : `undefined: ${field.query}`;

		finalData[key] = convertDataType(applyPattern(raw, field.regex), field.dataType);
	}

	return finalData;
};
