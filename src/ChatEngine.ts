import { PromptEngine } from "./PromptEngine";
import { Interaction, IModelConfig, IChatConfig } from "./types";
import { dashesToCamelCase } from "./utils/utils";

export const DefaultChatConfig: IChatConfig = {
  modelConfig: {
    maxTokens: 1024,
  },
  userName: "USER",
  botName: "BOT",
  newlineOperator: "\n",
};

export class ChatEngine extends PromptEngine {
  languageConfig: IChatConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    flowResetText: string = "",
    languageConfig: IChatConfig = DefaultChatConfig
  ) {
    super(description, examples, flowResetText);
    this.languageConfig = { ...DefaultChatConfig, ...languageConfig};
    this.promptConfig = {
      modelConfig: this.languageConfig.modelConfig,
      inputPrefix: this.languageConfig.userName + ":",
      inputPostfix: "",
      outputPrefix: this.languageConfig.botName + ":",
      outputPostfix: "",
      descriptionPrefix: "",
      descriptionPostfix: "",
      newlineOperator: this.languageConfig.newlineOperator,
    }
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
          this.languageConfig.modelConfig = { ...this.promptConfig.modelConfig, ...camelCaseModelConfig };
          delete configData["model-config"];
        }
        const camelCaseConfig = {};
        for (const key in configData) {
          camelCaseConfig[dashesToCamelCase(key)] = configData[key];
        }
        this.languageConfig = { ...this.languageConfig, ...camelCaseConfig };
        this.promptConfig = {
          modelConfig: this.languageConfig.modelConfig,
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