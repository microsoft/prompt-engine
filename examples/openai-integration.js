const fetch = require("isomorphic-fetch");
const { CodeEngine, JavaScriptConfig } = require("../out/CodeEngine");

async function getCompletion(promptEngine, command, openai_key, engine_id="code-davinci-002" ) {      
    let prompt = promptEngine.craftPrompt(command);

    // To learn more about making requests to OpanAI API, please refer to https://beta.openai.com/docs/api-reference/making-requests.
    // Here we use the following endpoint pattern for engine selection.
    // https://api.openai.com/v1/engines/{engine_id}/completions
    // You can switch to different engines that are available to you. Learn more about engines - https://beta.openai.com/docs/engines/engines
    const response = await fetch(`https://api.openai.com/v1/engines/${engine_id}/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openai_key}`,
        },
        body: JSON.stringify({
            prompt,
            max_tokens: promptEngine.max_tokens,
            temperature: 0,
            stop: JavaScriptConfig.commentOperator,
            n: 1
        })
    });

    // catch errors
    if (!response.ok) {
        //throw new Error(`${response.status} ${response.statusText}`);
        const error = `There is an issue with your OpenAI credentials, please check your OpenAI API key, organization ID and model name. Modify the credentials and restart the server!`;
        if (response.status == 404){
            console.log(error);
        }
        return error;
    }

    const json = await response.json();
    let code = json.choices[0].text;

    promptEngine.addInteraction(command, code);
     

    return code;
}

const maxPromptLength = 3200;

let description = "Natural Language Commands to Math Code";
let examples = [
  { input: "what's 10 plus 18", response: "console.log(10 + 18)" },
  { input: "what's 10 times 18", response: "console.log(10 * 18)" },
];

const promptEngine = new CodeEngine(description, examples, {
  maxTokens: maxPromptLength, 
}, "", JavaScriptConfig);

getCompletion(promptEngine, "what's 18 to the power of 10", "api_key").then((code) => {
    console.log(code)
});