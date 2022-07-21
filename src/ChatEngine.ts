import { DefaultModelConfig, PromptEngine } from "./PromptEngine";
import { Interaction, IModelConfig, IChatConfig } from "./types";
import { dashesToCamelCase } from "./utils/utils";

export const DefaultChatConfig: IChatConfig = {
  userName: "USER",
  botName: "BOT",
  newlineOperator: "\n",
};

export class ChatEngine extends PromptEngine {
  languageConfig: IChatConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: IModelConfig = DefaultModelConfig,
    flowResetText: string = "",
    languageConfig: IChatConfig = DefaultChatConfig
  ) {
    super(description, examples, modelConfig, flowResetText);
    this.languageConfig = languageConfig;
    this.promptConfig = {
      inputPrefix: languageConfig.userName + ":",
      inputPostfix: "",
      outputPrefix: languageConfig.botName + ":",
      outputPostfix: "",
      descriptionPrefix: "",
      descriptionPostfix: "",
      newlineOperator: languageConfig.newlineOperator,
    };
  }

  protected loadConfigYAML(parsedYAML: Record<string, any>) {
    if (parsedYAML["type"] == "chat-engine") {
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
          inputPrefix: this.languageConfig.userName + ":",
          inputPostfix: "",
          outputPrefix: this.languageConfig.botName + ":",
          outputPostfix: "",
          descriptionPrefix: "",
          descriptionPostfix: "",
          newlineOperator: this.languageConfig.newlineOperator,
        };
      }
    } else {
      throw Error("Invalid yaml file type");
    }
  }
}