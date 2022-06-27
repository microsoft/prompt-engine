import { DefaultModelConfig, PromptEngine } from "./PromptEngine";
import { Interaction, ModelConfig, CodePromptConfig } from "./types";

export const JavaScriptConfig: CodePromptConfig = {
  commentOperator: "/*",
  closeCommentOperator: "*/",
  newLineOperator: "\n",
};

export class CodeEngine extends PromptEngine {
  languageConfig: CodePromptConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: ModelConfig = DefaultModelConfig,
    languageConfig: CodePromptConfig = JavaScriptConfig
  ) {
    super(description, examples, modelConfig);
    this.languageConfig = languageConfig;
    this.promptConfig = {
      inputPrefix: languageConfig.commentOperator,
      inputPostfix: languageConfig.closeCommentOperator,
      outputPrefix: "",
      outputPostfix: "",
      descriptionPrefix: languageConfig.commentOperator,
      descriptionPostfix: languageConfig.closeCommentOperator,
      newLineOperator: languageConfig.newLineOperator,
    };
  }
}
