module.exports.askJson = async function(prompt) {
	console.debug(`Asking to LLM for JSON response from prompt (${prompt.length/1024^0}kb)`);

	const deepSeekKey = process.env.DEEPSEEK_KEY;
	const url = "https://api.deepseek.com/chat/completions";
	const promptForceJson = 
		prompt +
		"NOTE IMPORTANT: Always return the response as json code only and nothing more!";

	const resp = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${deepSeekKey}`
		},
		body: JSON.stringify({
			"model": "deepseek-v4-flash",
			"messages": [
				{"role": "user", "content": promptForceJson}
			],
			"response_format": {
				"type": "json_object"
			}
		})
	})
		.then(resp => resp.json())
		.catch(error => { error });

	if (resp.error) {
		throw "Something wrong happened while sending the prompt to DeepSeek model: " + JSON.stringify(resp.error);
	}

	try {
		const content = resp.choices[0].message.content;
		const match = content.match(/```json\s*([\s\S]*?)\s*```/);
		const finalContent = match ? match[1] : content;
		const jsonData = JSON.parse(finalContent);

		return jsonData;
	}
	catch(err) {
		throw "Could not parse the DeepSeek response as a JSON document";
	}
};
