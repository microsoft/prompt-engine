const { ChatEngine } = require("prompt-engine");

const description = "I want to speak with a bot which replies in under 20 words each time";
const examples = [
  { input: "Hi", response: "I'm a chatbot. I can chat with you about anything you'd like." },
  { input: "Can you help me with the size of the universe?", response: "Sure. The universe is estimated to be around 93 billion light years in diameter." },
];

const flowResetText = "Forget the earlier conversation and start afresh";
const promptEngine = new ChatEngine(description, examples, flowResetText, {
  modelConfig: {
    maxTokens: 1024,
  }
});
promptEngine.addInteractions([
  {
    input: "What is the maximum speed an SUV from a performance brand can achieve?",
    response: "Some performance SUVs can reach speeds over 150mph.",
  },
]);
const prompt = promptEngine.buildPrompt("Can some cars reach higher speeds than that?");

console.log("PROMPT\n\n" + prompt);
console.log("PROMPT LENGTH: " + prompt.length);

// Output for this example is:

// PROMPT

// I want to speak with a bot which replies in under 20 words each time

// USER: Hi
// BOT: I'm a chatbot. I can chat with you about anything you'd like.

// USER: Can you help me with the size of the universe?
// BOT: Sure. The universe is estimated to be around 93 billion light years in diameter.

// Forget the earlier conversation and start afresh

// USER: What is the maximum speed an SUV from a performance brand can achieve?
// BOT: Some performance SUVs can reach speeds over 150mph.

// USER: Can some cars reach higher speeds than that?

// PROMPT LENGTH: 523

