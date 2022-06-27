// Tests for NLToCode.ts using Jest

import { ChatEngine } from "../src/ChatEngine";

// Test creation of an empty chat prompt
describe("Empty chat Prompt should produce the correct context and prompt", () => {
  let chatEngine: ChatEngine;
  beforeEach(() => {
    chatEngine = new ChatEngine();
  });

  test("should create an empty Code prompt", () => {
    let context = chatEngine.buildContext();
    expect(context).toBe("");
  });

  test("should create an chat prompt with no description or examples", () => {
    let prompt = chatEngine.craftPrompt("Make a cube");
    console.log(prompt);
    expect(prompt).toBe("YOU: Make a cube\n");
  });
});

// Test creation of a chat prompt with input and response
describe("Empty NL-to-Code Prompt should produce the correct context and prompt", () => {
  let chatEngine: ChatEngine;

  let description =
    "The following are examples of natural language commands and the code necessary to accomplish them";

  let examples = [
    { input: "What is a cube?", response: "a symmetrical three-dimensional shape, either solid or hollow, contained by six equal squares" },
    { input: "What is a sphere?", response: "a round solid figure, or its surface, with every point on its surface equidistant from its centre" },
  ];

  test("should create a chat prompt with description", () => {
    let chatEngine = new ChatEngine(description);
    let prompt = chatEngine.craftPrompt("what is a rectangle");
    expect(prompt).toBe(`${description}\n\nYOU: what is a rectangle\n`);
  });

  
  chatEngine = new ChatEngine(description, examples);

  test("should create a chat prompt with description and examples", () => {
    let prompt = chatEngine.craftPrompt("what is a rectangle");
    expect(prompt).toBe(
      `${description}\n\nYOU: What is a cube?\nBOT: a symmetrical three-dimensional shape, either solid or hollow, contained by six equal squares\n\nYOU: What is a sphere?\nBOT: a round solid figure, or its surface, with every point on its surface equidistant from its centre\n\nYOU: what is a rectangle\n`
    );
  });

  test("should add an interaction to chat prompt", () => {
    chatEngine.addInteraction({
      input: "what is a rectangle",
      response: "a rectangle is a rectangle",
    });
    let prompt = chatEngine.craftPrompt("what is a cylinder");
    expect(prompt).toBe(
      `${description}\n\nYOU: What is a cube?\nBOT: a symmetrical three-dimensional shape, either solid or hollow, contained by six equal squares\n\nYOU: What is a sphere?\nBOT: a round solid figure, or its surface, with every point on its surface equidistant from its centre\n\nYOU: what is a rectangle\nBOT: a rectangle is a rectangle\n\nYOU: what is a cylinder\n`
    );
  });

});