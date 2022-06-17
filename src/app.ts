import { CodeEngine } from "./CodeEngine";

let promptEngine: CodeEngine;
let description = "Natural Language Commands to Math Code";
let examples = [
  { input: "what's 10 plus 18", response: "console.log(10 + 18)" },
  { input: "what's 10 times 18", response: "console.log(10 * 18)" },
];

promptEngine = new CodeEngine(description, examples, undefined, {
    maxTokens: 260,
  });
  promptEngine.addInteractions([
    {
      input: "what's 18 divided by 10",
      response: "console.log(18 / 10);",
    },
    {
      input: "what's 18 factorial 10",
      response: "console.log(18 % 10);",
    },
  ]);
  let prompt = promptEngine.craftPrompt("what's 18 to the power of 10");

console.log("PROMPT: " + prompt);
console.log("PROMPT LENGTH: " + prompt.length);