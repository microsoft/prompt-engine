import {
  Interaction,
  IPromptConfig,
  IModelConfig,
  Prompt,
  IPromptEngine,
  Context,
  Dialog,
} from "./types";

import GPT3Tokenizer from "gpt3-tokenizer";

export const DefaultPromptConfig: IPromptConfig = {
  inputPrefix: "",
  inputPostfix: "",
  outputPrefix: "",
  outputPostfix: "",
  descriptionPrefix: "",
  descriptionPostfix: "",
  newLineOperator: "\n",
};

export const DefaultModelConfig: IModelConfig = {
  maxTokens: 4096,
};

const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

export class PromptEngine implements IPromptEngine {
  protected promptConfig: IPromptConfig; // Configuration for the prompt engine
  protected modelConfig: IModelConfig; // Configuration for the model being used
  protected description?: string; // Description of the task for the model
  protected examples: Interaction[]; // Few show examples of input -> response for the model
  protected flowResetText?: string; // Flow Reset Text to reset the execution flow and any ongoing remnants of the examples
  protected dialog: Interaction[]; // Ongoing input responses, updated as the user interacts with the model

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: IModelConfig = DefaultModelConfig,
    flowResetText: string = "",
    promptConfig: IPromptConfig = DefaultPromptConfig
  ) {
    this.description = description;
    this.examples = examples;
    this.modelConfig = modelConfig;
    this.flowResetText = flowResetText;
    this.promptConfig = promptConfig;
    this.dialog = [];
  }

  /**
   *
   * @param context ongoing context to add description to
   * @returns context with description added to it
   */
  protected insertDescription(context: string) {
    if (this.description) {
      context += this.promptConfig.descriptionPrefix
        ? `${this.promptConfig.descriptionPrefix} `
        : "";
      context += `${this.description}`;
      context += this.promptConfig.descriptionPostfix
        ? ` ${this.promptConfig.descriptionPostfix}`
        : "";
      context += this.promptConfig.newLineOperator;
      context += this.promptConfig.newLineOperator;
      return context;
    } else {
      return "";
    }
  }

  /**
   *
   * @param context ongoing context to add examples to
   * @returns context with examples added to it
   */
  protected insertExamples(context: string) {
    if (this.examples.length > 0) {
      context += this.stringifyInteractions(this.examples);
    }
    return context;
  }

  /**
   *
   * @param context ongoing context to add description to
   * @returns context with description added to it
   */
   protected insertFlowResetText(context: string) {
    if (this.flowResetText) {
      context += this.promptConfig.descriptionPrefix
        ? `${this.promptConfig.descriptionPrefix} `
        : "";
      context += `${this.flowResetText}`;
      context += this.promptConfig.descriptionPostfix
        ? ` ${this.promptConfig.descriptionPostfix}`
        : "";
      context += this.promptConfig.newLineOperator;
      context += this.promptConfig.newLineOperator;
    }
    return context;
    
  }

  /**
   * @param context ongoing context to add dialogs to
   * @returns context with dialog added to it, only appending the last interactions if the context becomes too long
   */
  protected insertInteractions(context: string, userInput?: string) {
    let dialogString = "";
    let i = this.dialog.length - 1;
    if (i >= 0) {
      while (
        i >= 0 &&
        this.assertTokenLimit(context + this.stringifyInteraction(this.dialog[i]) + dialogString, userInput) === false
      ) {
        dialogString = this.stringifyInteraction(this.dialog[i]) + dialogString

        i--;
      }
    }
    context += dialogString;
    return context;
  }

  /**
   * Throws an error if the context is longer than the max tokens
   */
  private throwContextOverflowError() {
    throw new Error(
      "Prompt is greater than the configured max tokens. Either shorten context (detail + examples) or increase the max tokens in the model config."
    );
  }

  /**
   *
   * @param input Interaction input to add to the ongoing dialog
   * @param response Interaction response to add to the ongoing dialog
   */
  public addInteraction(input: string, response: string) {
    this.dialog.push({
      input: input,
      response: response,
    });
  }

  /**
   *
   * @param interactions Interactions to add to the ongoing dialog
   */
  public addInteractions(interactions: Interaction[]) {
    interactions.forEach((interaction) => {
      this.addInteraction(interaction.input, interaction.response);
    });
  }

  /**
   * Removes the first interaction from the dialog
   */
  public removeFirstInteraction() {
    return this.dialog.shift();
  }

  /**
   * Removes the last interaction from the dialog
   */
  public removeLastInteraction() {
    return this.dialog.pop();
  }

  /**
   *
   * @param input Example input to add to the examples
   * @param response Example output to add to the examples
   */
     public addExample(input: string, response: string) {
      this.examples.push({
        input: input,
        response: response,
      });
    }

  /**
   *
   * @param inputLength Length of the input string - used to determine how long the context can be
   * @returns A context string containing description, examples and ongoing interactions with the model
   */
  public buildContext(userInput?: string): Context {
    let context = "";
    context = this.insertDescription(context);
    context = this.insertExamples(context);
    context = this.insertFlowResetText(context);
    // If the context is too long without dialogs, throw an error
    if (this.assertTokenLimit(context, userInput) === true) {
      this.throwContextOverflowError();
    }

    context = this.insertInteractions(context, userInput);
    return context;
  }

  /**
   *
   * @returns A reset context string containing description and examples without any previous interactions with the model
   */
  public resetContext(): Context {
    
    this.dialog = [];
    return this.buildContext();
  }

  /**
   *
   * @param input Natural Language input from user
   * @returns A prompt string to pass a language model. This prompt
   * includes the description of the task and few shot examples of input -> response.
   * It then appends the current interaction history and the current input,
   * to effectively coax a new response from the model.
   */
  public buildPrompt(input: string): Prompt {
    let formattedInput = this.formatInput(input);
    let prompt = this.buildContext(formattedInput);
    prompt += formattedInput;
    return prompt;
  }

  /**
   *
   * @returns It returns the built interaction history
   */
   public buildDialog(): Dialog {
    let dialogString = "";
    let i = this.dialog.length - 1;
    if (i >= 0) {
      while (
        i >= 0
      ) {
        dialogString = this.stringifyInteraction(this.dialog[i]) + dialogString;
        i--;
      }
    }
    return dialogString;
  }

  /**
   * @param naturalLanguage Natural Language input, e.g. 'Make a cube"'
   * @returns Natural Language formatted as a comment, e.g. /* Make a cube *\/
   */
  private formatInput = (naturalLanguage: string): string => {
    let formatted = "";
    formatted += this.promptConfig.inputPrefix
      ? `${this.promptConfig.inputPrefix} `
      : "";
    formatted += `${naturalLanguage}`;
    formatted += this.promptConfig.inputPostfix
      ? ` ${this.promptConfig.inputPostfix}`
      : "";
    formatted += this.promptConfig.newLineOperator
      ? this.promptConfig.newLineOperator
      : "";
    return formatted;
  };

  private formatOutput = (output: string): string => {
    let formatted = "";
    formatted += this.promptConfig.outputPrefix
      ? `${this.promptConfig.outputPrefix} `
      : "";
    formatted += `${output}`;
    formatted += this.promptConfig.outputPostfix
      ? ` ${this.promptConfig.outputPostfix}`
      : "";
    formatted += this.promptConfig.newLineOperator
      ? this.promptConfig.newLineOperator
      : "";
    return formatted;
  };

  protected stringifyInteraction = (interaction: Interaction) => {
    let stringInteraction = "";
    stringInteraction += this.formatInput(interaction.input);
    stringInteraction += this.formatOutput(interaction.response);
    stringInteraction += this.promptConfig.newLineOperator;
    return stringInteraction;
  };

  protected stringifyInteractions = (interactions: Interaction[]) => {
    let stringInteractions = "";
    interactions.forEach((interaction) => {
      stringInteractions += this.stringifyInteraction(interaction);
    });
    return stringInteractions;
  };

  protected assertTokenLimit(context: string = "", userInput: string = "") {
    if (context !== undefined && userInput !== undefined){
      if (context !== ""){
        let numTokens = tokenizer.encode(context).text.length;
        if (userInput !== ""){
          numTokens = tokenizer.encode(context + userInput).text.length;
        }
        if (numTokens > this.modelConfig.maxTokens){
          return true;
        } else {
          return false;
        }
      } else {
        return false
      }
    } else {
      return false
    }
  }

}
