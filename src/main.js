const utils = require("./utils");
const scraper = require("./scraper");

(async function() {
	const data = await scraper.createScrapeSchema(
		"https://www.climatempo.com.br/previsao-do-tempo/cidade/334/natal-rn",
	{
		thermalSensation: "<integer>",
		temperature: "<integer>",
		wind: "<integer(km/h)>",
		sunOpen: "<HH:MM>",
		sunEnd: "<HH:MM>",
		message: "<.debug>",
	});
	utils.saveJson(data, "schemas/schema-clima-tempo.json");
})();
