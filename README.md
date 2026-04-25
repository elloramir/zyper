### Zyper

Zyper is a tiny helper for creating and using web scraping schemas.
Its main focus is letting you describe extraction rules in plain, explanatory language so the model can build the regex for you, instead of you manually hunting elements and crafting patterns by hand.
It keeps the flow simple: you feed HTML into the encoder, ask an LLM to map fields, and then reuse the generated selectors to scrape consistently.

Unlike heavier scraping stacks, this project leans on plain DOM + CSS selectors and keeps everything close to JavaScript.

General idea: generate a schema once, then reuse it for fast scraping runs.
You write natural-language hints next to each field, and Zyper turns those hints into regex and a stable selector.
The short example below shows how to create a schema and use it right away.

### Notes
- Requires `DEEPSEEK_KEY` in the environment for schema generation.
- You can override the default LLM by providing a custom `askJson` function that returns structured data.

```js
const schema = await scraper.createScrapeSchema(
    "https://example.com",
    {
        title: "<string> (on regex, make initial letters capitalized)",
        price: "<float> (on regex, remove $ sign)",
        updatedAt: "<HH:MM> (can keep as string, but make sure to format as HH:MM)",
    }
);

utils.saveJson(schema, "schemas/schema-example.json");

const stored = utils.openJson("schemas/schema-example.json");
const data = await scraper.scrapeSite("https://example.com", stored);
// returns { title: "Example Domain", price: 9.99, updatedAt: "12:30" }
```

The schema is just JSON with three values per field: selector, regex, and data type.
This makes it portable, easy to version, and quick to tweak by hand.

