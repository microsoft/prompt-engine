import { PromptEngine } from "./PromptEngine";
import { Interaction, IModelConfig, IChatConfig } from "./types";
import { dashesToCamelCase } from "./utils/utils";
import { stringify } from "yaml";

export const DefaultChatConfig: IChatConfig = {
  modelConfig: {
    maxTokens: 1024,
  },
  userName: "USER",
  botName: "BOT",
  newlineOperator: "\n",
  multiTurn: true,
  promptNewlineEnd: false,
};

export class ChatEngine extends PromptEngine {
  languageConfig: IChatConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    flowResetText: string = "",
    languageConfig: Partial<IChatConfig> = DefaultChatConfig
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
      multiTurn: this.languageConfig.multiTurn,
      promptNewlineEnd: this.languageConfig.promptNewlineEnd,
    }
  }

 /**
   * 
   * @param parsedYAML Yaml dict to load config from
   * 
   **/ 
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
          multiTurn: this.languageConfig.multiTurn,
          promptNewlineEnd: this.languageConfig.promptNewlineEnd,
        };
      }
    } else {
      throw Error("Invalid yaml file type");
    }
  }
  
  
  /**
   * 
   * @returns the stringified yaml representation of the prompt engine
   * 
   **/
  public saveYAML(){
    const yamlData: any = {
      "type": "chat-engine",
      "description": this.description,
      "examples": this.examples,
      "flow-reset-text": this.flowResetText,
      "dialog": this.dialog,
      "config": {
        "model-config" : this.promptConfig.modelConfig,
        "user-name": this.languageConfig.userName,
        "bot-name": this.languageConfig.botName,
        "newline-operator": this.languageConfig.newlineOperator
      }
    }
    return stringify(yamlData, null, 2);
  }
}