const utils = require("./utils");
const scraper = require("./scraper");
const analyzer = require("./analyzer");

async function fromManualDescriptor() {
    const url = "https://www.climatempo.com.br/previsao-do-tempo/cidade/334/natal-rn";
	const schema = await scraper.createScrapeSchema({
		meta: {
			url: url,
		},
		api: {
			thermalSensation: "save it as integer, without the ° symbol",
			temperature: "same as thermal sensation",
			wind: "save it as float, in km/h, without any symbol or metric unit",
			sunOpen: "it's the time when the sun starts to shine, save it as HH:MM in 24h format",
			sunEnd: "it's the time when the sun stops shining, save it as HH:MM in 24h format",
			message: "a descriptive message about the weather conditions, save it as string",
		},
	});
    const data = await scraper.scrapeSite(schema);
    console.log(data);
}

async function fromAutoDescriptor() {
    const url = "https://coinmarketcap.com/";
    const descriptor = await analyzer.autoSchemaDescriptor(url, "Give me the list of coin prices");
    const schema = await scraper.createScrapeSchema(descriptor);
    const data = await scraper.scrapeSite(schema);
	console.log(data);
}

(async function() {
    // await fromManualDescriptor();
    await fromAutoDescriptor();
})();
