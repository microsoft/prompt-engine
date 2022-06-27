// Tests for NLToCode.ts using Jest

import { CodeEngine } from "../src/CodeEngine";

// Test creation of an empty NL-to-Code prompt
describe("Empty NL-to-Code Prompt should produce the correct context and prompt", () => {
  let codeEngine: CodeEngine;
  beforeEach(() => {
    codeEngine = new CodeEngine();
  });

  test("should create an empty Code prompt", () => {
    let context = codeEngine.buildContext();
    expect(context).toBe("");
  });

  test("should create an NL-to-Code prompt with no description or examples", () => {
    let prompt = codeEngine.craftPrompt("Make a cube");
    console.log(prompt);
    expect(prompt).toBe("/* Make a cube */\n");
  });
});

// Test Code Engine with just description (no examples - zero shot)
describe("Initialized NL-to-Code Engine should produce the correct prompt", () => {
  let codeEngine: CodeEngine;
  let description =
    "The following are examples of natural language commands and the code necessary to accomplish them";

  let examples = [
    { input: "Make a cube", response: "makeCube();" },
    { input: "Make a sphere", response: "makeSphere();" },
  ];

  test("should create an NL-to-Code prompt with description", () => {
    let codeEngine = new CodeEngine(description);
    let prompt = codeEngine.craftPrompt("Make a cube");
    expect(prompt).toBe(`/* ${description} */\n\n/* Make a cube */\n`);
  });

  codeEngine = new CodeEngine(description, examples);

  test("should create an NL-to-Code prompt with description and examples", () => {
    let prompt = codeEngine.craftPrompt("Make a cylinder");
    expect(prompt).toBe(
      `/* ${description} */\n\n/* Make a cube */\nmakeCube();\n\n/* Make a sphere */\nmakeSphere();\n\n/* Make a cylinder */\n`
    );
  });

  test("should add an interaction to NL-to-Code prompt", () => {
    codeEngine.addInteraction("Make a cylinder", 
                              "makeCylinder();");
    let prompt = codeEngine.craftPrompt("Make a double helix");
    expect(prompt).toBe(
      `/* ${description} */\n\n/* Make a cube */\nmakeCube();\n\n/* Make a sphere */\nmakeSphere();\n\n/* Make a cylinder */\nmakeCylinder();\n\n/* Make a double helix */\n`
    );
  });

  test("should add a second interaction to NL-to-Code prompt", () => {
    codeEngine.addInteraction("Make a double helix", 
                              "makeDoubleHelix();");
    let prompt = codeEngine.craftPrompt("make a torus");
    expect(prompt).toBe(
      `/* ${description} */\n\n/* Make a cube */\nmakeCube();\n\n/* Make a sphere */\nmakeSphere();\n\n/* Make a cylinder */\nmakeCylinder();\n\n/* Make a double helix */\nmakeDoubleHelix();\n\n/* make a torus */\n`
    );
  });

  test("should remove last interaction from NL-to-Code prompt", () => {
    codeEngine.removeLastInteraction();
    let prompt = codeEngine.craftPrompt("make a torus");
    expect(prompt).toBe(
      `/* ${description} */\n\n/* Make a cube */\nmakeCube();\n\n/* Make a sphere */\nmakeSphere();\n\n/* Make a cylinder */\nmakeCylinder();\n\n/* make a torus */\n`
    );
  });
});

describe("Code prompt should truncate when too long", () => {
  let description = "Natural Language Commands to Math Code";
  let examples = [
    { input: "what's 10 plus 18", response: "console.log(10 + 18);" },
    { input: "what's 10 times 18", response: "console.log(10 * 18);" },
  ];

  test("should remove only dialog prompt when too long", () => {
    let codeEngine = new CodeEngine(description, examples, {
      maxTokens: 180,
    });
    codeEngine.addInteraction("what's 18 divided by 10",
                              "console.log(18 / 10);");
    let prompt = codeEngine.craftPrompt("what's 18 factorial 10");
    expect(prompt).toBe(
      `/* ${description} */\n\n/* what's 10 plus 18 */\nconsole.log(10 + 18);\n\n/* what's 10 times 18 */\nconsole.log(10 * 18);\n\n/* what's 18 factorial 10 */\n`
    );
  });

  test("should remove first dialog prompt when too long", () => {
    let codeEngine = new CodeEngine(description, examples, {
      maxTokens: 260,
    });
    codeEngine.addInteractions([
      {
        input: "what's 18 divided by 10",
        response: "console.log(18 / 10);",
      },
      {
        input: "what's 18 factorial 10",
        response: "console.log(18 % 10);",
      },
    ]);
    let prompt = codeEngine.craftPrompt("what's 18 to the power of 10");
    expect(prompt).toBe(
      `/* ${description} */\n\n/* what's 10 plus 18 */\nconsole.log(10 + 18);\n\n/* what's 10 times 18 */\nconsole.log(10 * 18);\n\n/* what's 18 factorial 10 */\nconsole.log(18 % 10);\n\n/* what's 18 to the power of 10 */\n`
    );
  });
});
