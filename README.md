# Prompt Engine

This repo contains an NPM utility library for creating and maintaining prompts for Large Language Models (LLMs).

## Background

LLMs like GPT-3 and Codex have continued to push the bounds of what AI is capable of - they can capably generate language and code, but are also capable of emergent behavior like question answering, summarization, classification and dialog. One of the best techniques for enabling specific behavior out of LLMs is called prompt engineering - crafting inputs that coax the model to produce certain kinds of outputs. Few-shot prompting is the discipline of giving examples of inputs and outputs, such that the model has a reference for the type of output you're looking for.

Prompt engineering can be as simple as formatting a question and passing it to the model, but it can also get quite complex - requiring substantial code to manipulate and update strings. This library aims to make that easier. It also aims to codify patterns and practices around prompt engineering.

See [How to get Codex to produce the code you want](https://microsoft.github.io/prompt-engineering/) article for an example of the prompt engineering patterns this library codifies. 

## Installation

`npm install prompt-engine`

## Usage

The library currently supports a generic `PromptEngine`, a `CodeEngine` and a `ChatEngine`. All three facilitate a pattern of prompt engineering where the prompt is composed of a description, examples of inputs and outputs and an ongoing "dialog" representing the ongoing input/output pairs as the user and model communicate. The dialog ensures that the model (which is stateless) has the context about what's happened in the conversation so far.

See architecture diagram representation:
  
<img src="https://user-images.githubusercontent.com/17247257/178334939-65e0e3ce-39b3-4abc-a889-7f2c0fb75f60.png" width="500">


### Code Engine

Code Engine creates prompts for Natural Language to Code scenarios. See TypeScript Syntax for importing `CodeEngine`:

```js
import { CodeEngine } from "prompt-engine";
```

NL->Code prompts should generally have a description, which should give context about the programming language the model should generate and libraries it should be using. The description should also give information about the task at hand:

```js
const description =
  "Natural Language Commands to JavaScript Math Code. The code should log the result of the command to the console.";
```

NL->Code prompts should also have examples of NL->Code interactions, exemplifying the kind of code you expect the model to produce. In this case, the inputs are math queries (e.g. "what is 2 + 2?") and code that console logs the result of the query.

```js
const examples = [
  { input: "what's 10 plus 18", response: "console.log(10 + 18)" },
  { input: "what's 10 times 18", response: "console.log(10 * 18)" },
];
```

By default, `CodeEngine` uses JavaScript as the programming language, but you can create prompts for different languages by passing a different `CodePromptConfig` into the constructor. If, for example, we wanted to produce Python prompts, we could have passed `CodeEngine` a `pythonConfig` specifying the comment operator it should be using:

```js
const pythonConfig = {
  commentOperator: "#",
}
const codeEngine = new CodeEngine(description, examples, flowResetText, pythonConfig);

```

With our description and our examples, we can go ahead and create our `CodeEngine`:

```js
const codeEngine = new CodeEngine(description, examples);
```

Now that we have our `CodeEngine`, we can use it to create prompts:

```js
const query = "What's 1018 times the ninth power of four?";
const prompt = codeEngine.buildPrompt(query);
```

The resulting prompt will be a string with the description, examples and the latest query formatted with comment operators and line breaks:

```js
/* Natural Language Commands to JavaScript Math Code. The code should log the result of the command to the console. */

/* what's 10 plus 18 */
console.log(10 + 18);

/* what's 10 times 18 */
console.log(10 * 18);

/* What's 1018 times the ninth power of four? */
```

Given the context, a capable code generation model can take the above prompt and guess the next line: `console.log(1018 * Math.pow(4, 9));`.

For multi-turn scenarios, where past conversations influences the next turn, Code Engine enables us to persist interactions in a prompt:

```js
...
// Assumes existence of code generation model
let code = model.generateCode(prompt);

// Adds interaction
codeEngine.addInteraction(query, code);
```

Now new prompts will include the latest NL->Code interaction:

```js
codeEngine.buildPrompt("How about the 8th power?");
```

Produces a prompt identical to the one above, but with the NL->Code dialog history:

```js
...
/* What's 1018 times the ninth power of four? */
console.log(1018 * Math.pow(4, 9));

/* How about the 8th power? */
```

With this context, the code generation model has the dialog context needed to understand what we mean by the query. In this case, the model would correctly generate `console.log(1018 * Math.pow(4, 8));`.

### Chat Engine

Just like Code Engine, Chat Engine creates prompts with descriptions and examples. The difference is that Chat Engine creates prompts for dialog scenarios, where both the user and the model use natural language. The `ChatEngine` constructor takes an optional `chatConfig` argument, which allows you to define the name of a user and chatbot in a multi-turn dialog: 

```js
const chatEngineConfig = {
  user: "Ryan",
  bot: "Gordon"
};
```

Chat prompts also benefit from a description that gives context. This description helps the model determine how the bot should respond. 

```js
const description = "A conversation with Gordon the Anxious Robot. Gordon tends to reply nervously and asks a lot of follow-up questions.";
```

Similarly, Chat Engine prompts can have examples interactions: 

```js
const examples = [
  { input: "Who made you?", response: "I don't know man! That's an awfully existential question. How would you answer it?" },
  { input: "Good point - do you at least know what you were made for?", response: "I'm OK at riveting, but that's not how I should answer a meaning of life question is it?"}
];
```

These examples help set the tone of the bot, in this case Gordon the Anxious Robot. Now we can create our `ChatEngine` and use it to create prompts:

```js
const chatEngine = new ChatEngine(description, examples, flowResetText, chatEngineConfig);
const userQuery = "What are you made of?";
const prompt = chatEngine.buildPrompt(userQuery);
```

When passed to a large language model (e.g. GPT-3), the context of the above prompt will help coax a good answer from the model, like "Subatomic particles at some level, but somehow I don't think that's what you were asking.". As with Code Engine, we can persist this answer and continue the dialog such that the model is aware of the conversation context: 

```js
chatEngine.addInteraction(userQuery, "Subatomic particles at some level, but somehow I don't think that's what you were asking.");
```

## Managing Prompt Overflow

Prompts for Large Language Models generally have limited size, depending on the language model being used. Given that prompt-engine can persist dialog history, it is possible for dialogs to get so long that the prompt overflows. The Prompt Engine pattern handles this situation by removing the oldest dialog interaction from the prompt, effectively only remembering the most recent interactions.

You can specify the maximum tokens allowed in your prompt by passing a `maxTokens` parameter when constructing the config for any prompt engine:

```js
let promptEngine = new PromptEngine(description, examples, flowResetText, {
  modelConfig: { maxTokens: 1000 }
});
```

## Available Functions

The following are the functions available on the `PromptEngine` class and those that inherit from it:

| Command | Parameters | Description | Returns |
|--|--|--|--|
| `buildContext` | None | Constructs and return the context with parameters provided to the Prompt Engine | Context: string |
| `buildPrompt` | Prompt: string | Combines the context from `buildContext` with a query to create a prompt | Prompt: string |
| `buildDialog` | None | Builds a dialog based on all the past interactions added to the Prompt Engine | Dialog: string |
| `addExample` | interaction: Interaction(input: string, response: string) | Adds the given example to the examples | None |
| `addInteraction` | interaction: Interaction(input: string, response: string) | Adds the given interaction to the dialog | None |
| `removeFirstInteraction` | None | Removes and returns the first interaction in the dialog | Interaction: string |
| `removeLastInteraction` | None | Removes and returns the last interaction added to the dialog | Interaction: string |
| `resetContext` | None | Removes all interactions from the dialog, returning the reset context | Context:string |

For more examples and insights into using the prompt-engine library, have a look at the [examples](https://github.com/microsoft/prompt-engine/tree/main/examples) folder

## YAML Representation
It can be useful to represent prompts as standalone files, versus code. This can allow easy swapping between different prompts, prompt versioning, and other advanced capabiliites. With this in mind, prompt-engine offers a way to represent prompts as YAML and to load that YAML into a prompt-engine class. See `examples/yaml-examples` for examples of YAML prompts and how they're loaded into prompt-engine.

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Statement of Purpose

This library aims to simplify use of Large Language Models, and to make it easy for developers to take advantage of existing patterns. The package is released in conjunction with the [Build 2022 AI examples](https://github.com/microsoft/Build2022-AI-examples), as the first three use a multi-turn LLM pattern that this library simplifies. This package works independently of any specific LLM - prompt generated by the package should be useable with various language and code generating models.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
