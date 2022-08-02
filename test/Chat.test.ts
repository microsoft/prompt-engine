// Tests for Chat Engine using Jest

import { ChatEngine } from "../src/ChatEngine";

// Test creation of an empty chat prompt
describe("Empty chat Prompt should produce the correct context and prompt", () => {
  let chatEngine: ChatEngine;
  beforeEach(() => {
    chatEngine = new ChatEngine();
  });

  test("should create an empty chat prompt", () => {
    let context = chatEngine.buildContext();
    expect(context).toBe("");
  });

  test("should create an chat prompt with no description or examples", () => {
    let prompt = chatEngine.buildPrompt("Make a cube");
    console.log(prompt);
    expect(prompt).toBe("USER: Make a cube\nBOT: ");
  });
});

// Test creation of a chat prompt with input and response
describe("Empty Chat Prompt should produce the correct context and prompt", () => {
  let chatEngine: ChatEngine;

  let description =
    "The following is a conversation with a bot about shapes";

  let examples = [
    { input: "What is a cube?", response: "a symmetrical three-dimensional shape, either solid or hollow, contained by six equal squares" },
    { input: "What is a sphere?", response: "a round solid figure, or its surface, with every point on its surface equidistant from its centre" },
  ];

  test("should create a chat prompt with description", () => {
    let chatEngine = new ChatEngine(description);
    let prompt = chatEngine.buildPrompt("what is a rectangle");
    expect(prompt).toBe(`${description}\n\nUSER: what is a rectangle\nBOT: `);
  });

  
  chatEngine = new ChatEngine(description, examples);

  test("should create a chat prompt with description and examples", () => {
    let prompt = chatEngine.buildPrompt("what is a rectangle");
    expect(prompt).toBe(
      `${description}\n\nUSER: What is a cube?\nBOT: a symmetrical three-dimensional shape, either solid or hollow, contained by six equal squares\n\nUSER: What is a sphere?\nBOT: a round solid figure, or its surface, with every point on its surface equidistant from its centre\n\nUSER: what is a rectangle\nBOT: `
    );
  });

  test("should add an interaction to chat prompt", () => {
    chatEngine.addInteraction("what is a rectangle",
                              "a rectangle is a rectangle");
    let prompt = chatEngine.buildPrompt("what is a cylinder");
    expect(prompt).toBe(
      `${description}\n\nUSER: What is a cube?\nBOT: a symmetrical three-dimensional shape, either solid or hollow, contained by six equal squares\n\nUSER: What is a sphere?\nBOT: a round solid figure, or its surface, with every point on its surface equidistant from its centre\n\nUSER: what is a rectangle\nBOT: a rectangle is a rectangle\n\nUSER: what is a cylinder\nBOT: `
    );
  });

});