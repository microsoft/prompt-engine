import {
  Interaction,
  PromptConfig,
  ModelConfig,
  Prompt,
  IPromptEngine,
  Context,
} from "./types";

export const DefaultPromptConfig: PromptConfig = {
  inputPrefix: "",
  inputPostfix: "",
  newLineOperator: "\n",
}

export const DefaultModelConfig: ModelConfig = {
  maxTokens: 4000,
};

export class PromptEngine implements IPromptEngine {
  protected promptConfig: PromptConfig; // Configuration for the prompt engine
  protected modelConfig: ModelConfig; // Configuration for the model being used
  protected description?: string; // Description of the task for the model
  protected examples: Interaction[]; // Few show examples of input -> response for the model
  protected dialog: Interaction[]; // Ongoing input responses, updated as the user interacts with the model

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: ModelConfig = DefaultModelConfig,
    promptConfig: PromptConfig = DefaultPromptConfig
  ) {
    this.description = description;
    this.examples = examples;
    this.modelConfig = modelConfig;
    this.promptConfig = promptConfig;
    this.dialog = [];
  }

  /**
   *
   * @param context ongoing context to add description to
   * @returns context with description added to it
   */
  private addDescription(context: string) {
    if (this.description) {
      context += `${this.promptConfig.inputPrefix} ${this.description}`;
      context += this.promptConfig.inputPostfix
        ? ` ${this.promptConfig.inputPostfix}`
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
  private addExamples(context: string) {
    if (this.examples.length > 0) {
      context += this.stringifyInteractions(this.examples);
    }
    return context;
  }

  /**
   * @param context ongoing context to add dialogs to
   * @returns context with dialog added to it, only appending the last interactions if the context becomes too long
   */
  private addDialog(context: string, inputLength?: number) {
    let dialogString = "";
    let i = this.dialog.length - 1;
    if (i >= 0) {
      let lastInteraction =
        this.stringifyInteraction(this.dialog[i]) + dialogString;
      while (
        dialogString.length + context.length + lastInteraction.length + inputLength <=
          this.modelConfig.maxTokens &&
        i >= 0
      ) {
        lastInteraction =
          this.stringifyInteraction(this.dialog[i]) + dialogString;
        dialogString = this.stringifyInteraction(this.dialog[i]) + dialogString;
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
   * @param interaction Interaction to add to the ongoing dialog
   */
  public addInteraction(interaction: Interaction) {
    this.dialog.push(interaction);
  }

  /**
   * 
   * @param interactions Interactions to add to the ongoing dialog
   */
  public addInteractions(interactions: Interaction[]) {
    interactions.forEach((interaction) => {
      this.addInteraction(interaction);
    });
  }

  /**
   * Removes the first interaction from the dialog
   */
  public removeFirstInteraction() {
    this.dialog.shift();
  }

  /**
   * Removes the last interaction from the dialog
   */
  public removeLastInteraction() {
    this.dialog.pop();
  }

  /**
   * 
   * @param inputLength Length of the input string - used to determine how long the context can be
   * @returns A context string containing description, examples and ongoing interactions with the model
   */
  public buildContext(inputLength?: number): Context {
    let context = "";
    context = this.addDescription(context);
    context = this.addExamples(context);

    // If the context is too long without dialogs, throw an error
    if (context.length > this.modelConfig.maxTokens) {
      this.throwContextOverflowError();
    }

    context = this.addDialog(context, inputLength);
    return context;
  }

  /**
   *
   * @param naturalLanguage Natural Language input from user
   * @returns A prompt string to pass a language model. This prompt
   * includes the description of the task and few shot examples of input -> response.
   * It then appends the current interaction history and the current input,
   * to effectively coax a new response from the model.
   */
  public craftPrompt(naturalLanguage: string): Prompt {
    let formattedInput = this.formatInput(naturalLanguage);
    let prompt = this.buildContext(formattedInput.length);
    prompt += formattedInput;
    return prompt;
  }

  /**
   * @param naturalLanguage Natural Language input, e.g. 'Make a cube"'
   * @returns Natural Language formatted as a comment, e.g. /* Make a cube *\/
   */
  private formatInput = (naturalLanguage: string): string => {
    let formatted = "";
    formatted += this.promptConfig.inputPrefix;
    formatted += ` ${naturalLanguage}`;
    formatted += this.promptConfig.inputPostfix
      ? ` ${this.promptConfig.inputPostfix}`
      : "";
    formatted += this.promptConfig.newLineOperator
      ? this.promptConfig.newLineOperator
      : "";
    return formatted;
  };

  private stringifyInteraction = (interaction: Interaction) => {
    let stringInteraction = "";
    stringInteraction += this.formatInput(interaction.input);
    stringInteraction += interaction.response;
    stringInteraction += this.promptConfig.newLineOperator;
    stringInteraction += this.promptConfig.newLineOperator;
    return stringInteraction;
  };

  private stringifyInteractions = (interactions: Interaction[]) => {
    let stringInteractions = "";
    interactions.forEach((interaction) => {
      stringInteractions += this.stringifyInteraction(interaction);
    });
    return stringInteractions;
  };
}
