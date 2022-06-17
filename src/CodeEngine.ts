import {
  Interaction,
  LanguageConfig,
  ModelConfig,
  Prompt,
  IPromptEngine,
  Context,
} from "./types";

export const JavaScriptConfig: LanguageConfig = {
  commentOperator: "/*",
  commentCloseOperator: "*/",
  newLineOperator: "\n",
};

export const DefaultModelConfig: ModelConfig = {
  maxTokens: 4000,
};

export class CodeEngine implements IPromptEngine {
  languageConfig: LanguageConfig; // Configuration for the programming language used
  modelConfig: ModelConfig; // Configuration for the model being used
  description?: string; // Description of the NL -> Code tasks
  examples: Interaction[]; // Few show examples of NL -> Code
  dialog: Interaction[]; // Ongoing NL -> Code dialog, updated as the user interacts with the model

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: ModelConfig = DefaultModelConfig,
    languageConfig: LanguageConfig = JavaScriptConfig,
  ) {
    this.description = description;
    this.examples = examples;
    this.languageConfig = languageConfig;
    this.modelConfig = modelConfig;
    this.dialog = [];
  }

  public addInteraction(interaction: Interaction) {
    this.dialog.push(interaction);
  }

  public addInteractions(interactions: Interaction[]) {
    interactions.forEach((interaction) => {
      this.addInteraction(interaction);
    });
  }

  public removeFirstInteraction() {
    this.dialog.shift();
  }

  public removeLastInteraction() {
    this.dialog.pop();
  }

  public buildContext(): Context {
    let context = "";
    if (this.description) {
      context = `${this.languageConfig.commentOperator} ${this.description}`;
      context += this.languageConfig.commentCloseOperator
        ? ` ${this.languageConfig.commentCloseOperator}`
        : "";
      context += this.languageConfig.newLineOperator;
      context += this.languageConfig.newLineOperator;
    }
    if (this.examples.length > 0) {
      context += this.stringifyInteractions(this.examples);
    }
    return context;
  }

  /**
   *
   * @param naturalLanguage Natural Language input, e.g. "Make a cube"
   * @returns A prompt string for a code generation model. If provided, this
   * prompt includes the description of the NL -> Code task and few shot examples
   * of NL -> Code. It then appends the current interaction history (NL -> Code dialog)
   * and the natural language command/query as a comment, e.g. /* Make a cube *\/
   * such that the model returns code that satisfies the natural language.
   */
  public craftPrompt(naturalLanguage: string): Prompt {
    let formattedNaturalLanguage = this.formatNaturalLanguage(naturalLanguage);
    let prompt = this.buildContext();

    let promptLength = prompt.length + formattedNaturalLanguage.length;
    if (promptLength > this.modelConfig.maxTokens) {
      throw new Error(
        "Context is greater than the configured max tokens. Either shorten context (detail + examples) or increase the max tokens in the model config."
      );
    }

    let dialogString = "";
    for (let i = this.dialog.length - 1; i >= 0; i--) {
      let lastInteraction =
        this.stringifyInteractions([this.dialog[i]]) + dialogString;
      if (
        promptLength + dialogString.length + lastInteraction.length <=
        this.modelConfig.maxTokens
      ) {
        dialogString =
          this.stringifyInteractions([this.dialog[i]]) + dialogString;
        promptLength += dialogString.length;
      } else {
        break;
      }
    }
    prompt += dialogString;
    prompt += formattedNaturalLanguage;
    return prompt;
  }

  /**
   * @param naturalLanguage Natural Language input, e.g. 'Make a cube"'
   * @returns Natural Language formatted as a comment, e.g. /* Make a cube *\/
   */
  private formatNaturalLanguage = (naturalLanguage: string): string => {
    let formatted = "";
    formatted += this.languageConfig.commentOperator;
    formatted += ` ${naturalLanguage}`;
    formatted += this.languageConfig.commentCloseOperator
      ? ` ${this.languageConfig.commentCloseOperator}`
      : "";
    formatted += this.languageConfig.newLineOperator
      ? this.languageConfig.newLineOperator
      : "";
    return formatted;
  };

  private stringifyInteractions = (interactions: Interaction[]) => {
    let stringInteractions = "";
    interactions.forEach((interaction) => {
      stringInteractions += this.formatNaturalLanguage(interaction.input);
      stringInteractions += interaction.response;
      stringInteractions += this.languageConfig.newLineOperator;
      stringInteractions += this.languageConfig.newLineOperator;
    });
    return stringInteractions;
  };
}
