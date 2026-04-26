const html = require("./html");
const llm = require("./llm");

module.exports.autoSchemaDescriptor = async function (url, extraContext) {
	const document = await html.loadDocument(url);
	const mapper = new Map();
	const encoded = html.encodeHTML(document.body, null, mapper);

	const dataResponse = await llm.askJson(`
		You are a web scraping schema generator.

		Your task is to analyze the encoded HTML below and infer the
		most useful extraction schema for the page.
		Generate a JSON object where each key is a field that should likely
		be extracted, and each value is a string describing the expected type,
		format, or extraction hint.

		Examples:
		{
			"temperature": "<integer>",
			"wind": "<integer (km/h)>",
			"message": "<string>",
			"price": "<number>",
			"date": "<date>",
			"tags": "<array of strings>",
			"description": "<string>"
		}

		Rules:
		- Infer only fields that are likely useful for extraction.
		- Choose field names that are clear, concise, and lowercase when possible.
		- For each field, describe the best expected datatype or extraction pattern.
		- Datatype hints may be broad or specific, for example:
			- <string>
			- <integer>
			- <number>
			- <boolean>
			- <date>
			- <datetime>
			- <array of strings>
			- <integer (km/h)>
			- <string (remove currency symbol)>
		- You may include extraction guidance inside the type hint when useful.
		- Do not invent fields that are not supported by the page content.
		- Prefer a schema that helps a second pass extract structured data reliably.
		- Return only valid JSON.

		Extra context:
		${extraContext || "No extra context was provided."}

		Encoded HTML:
		${encoded}
	`);

	return {
		meta: {
			url: url,
		},
		api: dataResponse,
	};
};