const { CodeEngine } = require("./../../out/CodeEngine");
const { readFileSync } = require("fs");

const promptEngine = new CodeEngine();

const yamlConfig = readFileSync("./examples/yaml-examples/code.yaml", "utf8");
promptEngine.loadYAML(yamlConfig);

const prompt = promptEngine.buildPrompt("what's 18 to the power of 10");

console.log(prompt)

// Output for this example is:
// 
// /* Natural Language Commands to Math Code */
// 
// /* what's 10 plus 18 */
// console.log(10 + 18)
// 
// /* what's 10 times 18 */
// console.log(10 * 18)
// 
// /* what's 18 divided by 10 */
// console.log(10 / 18)
// 
// /* what's 18 factorial 10 */
// console.log(10 % 18)
// 
// /* what's 18 to the power of 10 */

