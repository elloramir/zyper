### Zyper Toy

*This project is in early stages, expect not proper error handling, rough edges, and a lot of room for improvement.*

Zyper is a tiny helper for creating and using web scraping schemas.
Its main focus is letting you describe extraction rules in plain, explanatory language so the model can build the regex for you, instead of you manually hunting elements and crafting patterns by hand.
It keeps the flow simple: you feed HTML into the encoder, ask an LLM to map fields, and then reuse the generated selectors to scrape consistently.

Unlike heavier scraping stacks, this project leans on plain DOM + CSS selectors and keeps everything close to JavaScript.

General idea: generate a schema once, then reuse it for fast scraping runs.
You write natural-language hints next to each field, and Zyper turns those hints into regex and a stable selector.

### Notes
- Requires `DEEPSEEK_KEY` in the environment for schema generation.
- You can override the default LLM by providing a custom `askJson` function that returns structured data.

## Usage Example

Let the LLM automatically infer the schema from the page content:

```js
const url = "https://example.com";
const descriptor = await analyzer.autoSchemaDescriptor(url, "Give me the list of prices");
const schema = await scraper.createScrapeSchema(descriptor);
const data = await scraper.scrapeSite(schema);
```

### Manual Descriptor

Define the schema manually if you know exactly which fields you want to extract:

```js
const schema = await scraper.createScrapeSchema({
    meta: {
        url: "https://example.com",
    },
    api: {
        title: "<string> (on regex, make initial letters capitalized)",
        price: "<float> (on regex, remove $ sign)",
        updatedAt: "<HH:MM> (can keep as string, but make sure to format as HH:MM)",
    }
});

const data = await scraper.scrapeSite(schema);
// returns { title: "Example Domain", price: 9.99, updatedAt: "12:30" }
```

The schema is JSON with meta + api. Each field has query, regex, and dataType.
This makes it portable, easy to version, and quick to tweak by hand.

### Goals
- [ ] Neasted schemas
- [ ] Even smaller encoded HTML for faster processing and better LLM performance
- [ ] Area of interest detection using algorithms like TextRank
- [ ] Better LLM API to use different models and providers
- [ ] Post-processing functions instead of regex for more complex transformations? (good idea or unsafe?)
- [ ] Render react and other SPA for better support (try to avoid headless browsers)
- [ ] Implement MCP for agentic AI integration
