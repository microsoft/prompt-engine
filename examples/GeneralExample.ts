import { PromptEngine } from "../src/PromptEngine";

const description = "I want to speak with a bot which replies in under 20 words each time";
const examples = [
  { input: "Hi", response: "I'm a chatbot. I can chat with you about anything you'd like." },
  { input: "Can you help me with the size of the universe?", response: "Sure. The universe is estimated to be around 93 billion light years in diameter." },
];
const flowResetText = "Forget the earlier conversation and start afresh";

const promptEngine = new PromptEngine(description, examples, {
  maxTokens: 512,
}, flowResetText);

promptEngine.addInteractions([
  { 
    input: "What is the size of an SUV in general?",
    response: "An SUV typically ranges from 16 to 20 feet long."
  },
]);

promptEngine.removeLastInteraction()

promptEngine.addInteraction("What is the maximum speed an SUV from a performance brand can achieve?", 
"Some performance SUVs can reach speeds over 150mph.");

const outputPrompt = promptEngine.buildPrompt("Can some cars reach higher speeds than that?");

console.log("PROMPT\n\n" + outputPrompt);
console.log("PROMPT LENGTH: " + outputPrompt.length);


/* Output for this example is:

PROMPT

I want to speak with a bot which replies in under 20 words each time

Hi
I'm a chatbot. I can chat with you about anything you'd like.

Can you help me with the size of the universe?
Sure. The universe is estimated to be around 93 billion light years in diameter.

Forget the earlier conversation and start afresh

What is the maximum speed an SUV from a performance brand can achieve?
Some performance SUVs can reach speeds over 150mph.

Can some cars reach higher speeds than that?

PROMPT LENGTH: 484

*/