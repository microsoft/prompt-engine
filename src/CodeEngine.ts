import { DefaultModelConfig, PromptEngine } from "./PromptEngine";
import { Interaction, IModelConfig, ICodePromptConfig } from "./types";
import { dashesToCamelCase } from "./utils/utils";

export const JavaScriptConfig: ICodePromptConfig = {
  descriptionCommentOperator: "/*/",
  descriptionCloseCommentOperator: "/*/",
  commentOperator: "/*",
  closeCommentOperator: "*/",
  newlineOperator: "\n",
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

  protected loadConfigYAML(parsedYAML: Record<string, any>) {
    if (parsedYAML["type"] == "code-engine") {
      if (parsedYAML.hasOwnProperty("config")){
        const configData = parsedYAML["config"]
        if (configData.hasOwnProperty("model-config")) {
          const modelConfig = configData["model-config"];
          const camelCaseModelConfig = {};
          for (const key in modelConfig) {
            camelCaseModelConfig[dashesToCamelCase(key)] = modelConfig[key];
          }
          this.modelConfig = { ...this.modelConfig, ...camelCaseModelConfig };
          delete configData["model-config"];
        }
        const camelCaseConfig = {};
        for (const key in configData) {
          camelCaseConfig[dashesToCamelCase(key)] = configData[key];
        }
        this.languageConfig = { ...this.languageConfig, ...camelCaseConfig };
        this.promptConfig = {
          inputPrefix: this.languageConfig.commentOperator,
          inputPostfix: this.languageConfig.closeCommentOperator,
          outputPrefix: "",
          outputPostfix: "",
          descriptionPrefix: this.languageConfig.commentOperator,
          descriptionPostfix: this.languageConfig.closeCommentOperator,
          newlineOperator: this.languageConfig.newlineOperator,
        };
      }
    } else {
      throw Error("Invalid yaml file type");
    }
  }

}
