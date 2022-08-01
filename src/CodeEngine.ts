import { DefaultModelConfig, PromptEngine } from "./PromptEngine";
import { Interaction, IModelConfig, ICodePromptConfig } from "./types";

export const JavaScriptConfig: ICodePromptConfig = {
  descriptionCommentOperator: "/*",
  descriptionCloseCommentOperator: "*/",
  commentOperator: "/*",
  closeCommentOperator: "*/",
  newLineOperator: "\n",
};

export class CodeEngine extends PromptEngine {
  languageConfig: ICodePromptConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: IModelConfig = DefaultModelConfig,
    flowResetText: string = "",
    languageConfig: ICodePromptConfig = JavaScriptConfig
  ) {
    super(description, examples, modelConfig, flowResetText);
    this.languageConfig = languageConfig;
    this.promptConfig = {
      inputPrefix: languageConfig.commentOperator,
      inputPostfix: languageConfig.closeCommentOperator,
      outputPrefix: "",
      outputPostfix: "",
      descriptionPrefix: languageConfig.descriptionCommentOperator,
      descriptionPostfix: languageConfig.descriptionCloseCommentOperator,
      newLineOperator: languageConfig.newLineOperator,
    };
  }
}
