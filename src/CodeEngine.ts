import { PromptEngine } from "./PromptEngine";
import { Interaction, ICodePromptConfig } from "./types";
import { dashesToCamelCase } from "./utils/utils";

export const JavaScriptConfig: ICodePromptConfig = {
  modelConfig: {
    maxTokens: 1024,
  },
  commentOperator: "/*",
  closeCommentOperator: "*/",
  newlineOperator: "\n",
};

export class CodeEngine extends PromptEngine {
  languageConfig: ICodePromptConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    flowResetText: string = "",
    languageConfig: Partial<ICodePromptConfig> = JavaScriptConfig
  ) {
    super(description, examples, flowResetText);
    this.languageConfig = { ...JavaScriptConfig, ...languageConfig};
    this.promptConfig = {
      modelConfig: this.languageConfig.modelConfig,
      inputPrefix: this.languageConfig.commentOperator,
      inputPostfix: this.languageConfig.closeCommentOperator,
      outputPrefix: "",
      outputPostfix: "",
      descriptionPrefix: this.languageConfig.commentOperator,
      descriptionPostfix: this.languageConfig.closeCommentOperator,
      newlineOperator: this.languageConfig.newlineOperator,
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
          this.languageConfig.modelConfig = { ...this.languageConfig.modelConfig, ...camelCaseModelConfig };
          delete configData["model-config"];
        }
        const camelCaseConfig = {};
        for (const key in configData) {
          camelCaseConfig[dashesToCamelCase(key)] = configData[key];
        }
        this.languageConfig = { ...this.languageConfig, ...camelCaseConfig };
        this.promptConfig = {
          modelConfig: this.languageConfig.modelConfig,
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
