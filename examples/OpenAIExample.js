const { CodeEngine, JavaScriptConfig } = require("prompt-engine");
const { Configuration, OpenAIApi } = require("openai");
const readline = require('readline');

// This is an example to showcase the capabilities of the prompt-engine and how it can be easily integrated
// into OpenAI's API for code generation

// Creating OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getCompletionWithPrompt(prompt, config) {
  const response = await openai.createCompletion({
    model: "code-davinci-002",
    prompt: prompt,
    temperature: 0.3,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: [config.commentOperator],
  });
  if (response.status === 200 && response.data.choices) {
    if (response.data.choices.length > 0 && response.data.choices[0].text) {
      return response.data.choices[0].text.trim();
    } else {
      console.log("OpenAI returned an empty response");
    }
  } else {
    console.log("OpenAI returned an error. Status: " + response.status);
  }
  return "";
}

// Creating a new code engine
const description = "Natural Language Commands to Math Code";
const examples = [
  { input: "what's 10 plus 18", response: "console.log(10 + 18)" },
  { input: "what's 10 times 18", response: "console.log(10 * 18)" },
];
const config = JavaScriptConfig

const promptEngine = new CodeEngine(description, examples, "", config);

// Creating a new readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Asking the user for input
rl.setPrompt(`Enter your command: `);
rl.prompt();
rl.on('line', function(line){
    const prompt = promptEngine.buildPrompt(line);
    console.log(prompt);
    getCompletionWithPrompt(prompt, config).then(function(output) {
      console.log(output);
      promptEngine.addInteraction(line, output);
      rl.setPrompt(`Enter your command: `);
      rl.prompt();
    });
})