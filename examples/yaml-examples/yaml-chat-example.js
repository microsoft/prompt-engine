const { ChatEngine } = require("prompt-engine");
const { readFileSync } = require("fs");

const promptEngine = new ChatEngine();

const yamlConfig = readFileSync("./examples/yaml-examples/chat.yaml", "utf8");
promptEngine.loadYAML(yamlConfig);

console.log(promptEngine.buildContext("", true))

/* Output for this example is:

What is the possibility of an event happening?

Abhishek: Roam around Mars
Bot: This will be possible in a couple years

Abhishek: Drive a car
Bot: This is possible after you get a learner drivers license

Starting a new conversation

Abhishek: Drink water
Bot: Uhm...You don't do that 8 times a day?

Abhishek: Walk on air
Bot: For that you'll need a special device

*/