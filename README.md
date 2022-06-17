# Prompt Engine

This repo contains an NPM utility library for creating and maintaining prompts for Large Language Models (LLMs). 

## Background
LLMs like GPT-3 and Codex have continued to push the bounds of what AI is capable of - they can capably generate language and code, but are also capable of emergent behavior like question answering, summarization, classification and dialog. One of the best techniques for enabling specific behavior out of LLMs is called prompt engineering - crafting inputs that coax the model to produce certain kinds of outputs. Prompt engineering can be as simple as formatting a question and passing it to the model, but it can also get quite complex - requiring substantial code to manipulate an dupdate strings. This library aims to make that easier. It also aims to codify patterns and practices around prompt engineering.

## Installation

`npm install prompt-engine`

## Usage

The library currently supports a single pattern of multi-turn Natural Language to Code prompt generation:

### Code Engine
Code Engine is a Prompt Engine that creates prompts for Natural Language to Code scenarios. These prompts generally have a description, which gives context for the NL->Code task and examples of NL->Code to coax specific behavior from the model. Code Engine can also keep track of new NL->Code interactions, allowing the model to effectively remember the last series of steps.

```js
// Import CodeEngine
import { CodeEngine } from 'prompt-engine';

// Add prompt description and NL->Code Examples
let description = "Natural Language Commands to Math Code";
let examples = [
  { input: "what's 10 plus 18", response: "console.log(10 + 18)" },
  { input: "what's 10 times 18", response: "console.log(10 * 18)" },
];

// Create CodeEngine to manage your NL->Code Prompt
let codeEngine = new CodeEngine(description, examples);

// Natural Language input 
let naturalLanguageQuery = "what's 18 divided by 10?";

// Creation of new prompt
let prompt = codeEngine.createPrompt(naturalLanguageQuery);
```

The above prompt is a string that formats the description of the task for the model to accomplish, examples of NL -> Code, and the latest natural language input:

```js
/* Natural Language Commands to Math Code */

/* what's 10 plus 18 */
console.log(10 + 18)

/* what's 10 times 18 */
console.log(10 * 18)

/* what's 18 divided by 10? */
```

Given a models response, you can use CodeEngine to add the interaction onto the prompt, giving the model "memory" of the last series of NL->Code interactions:

```js
...
// Assumes existsence of code generation model
let code = model.generateCode(prompt);

// Adds interaction
codeEngine.addInteraction({
    input: naturalLanguageQuery,
    response: code
});
```

Now new prompts will include the latest NL->Code interaction:

```js
codeEngine.createPrompt("double that");
```

Produces a prompt identical to the one above, but with the NL->Code dialog history:

```js
...
/* what's 18 divided by 10 */
console.log(18 / 10)

/* double that */
```

With this context, the code generation model has what it needs to resolve "that" as the result of the last NL->Code interaction. In this case, the model would correctly generate `console.log(1.8 * 2)`.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
