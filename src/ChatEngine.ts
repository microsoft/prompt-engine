import { DefaultModelConfig, PromptEngine } from "./PromptEngine";
import { Interaction, ModelConfig, ChatConfig } from "./types";

export const JavaScriptConfig: ChatConfig = {
  userName: "YOU",
  botName: "BOT",
  newLineOperator: "\n",
};

export class ChatEngine extends PromptEngine {
  languageConfig: ChatConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: ModelConfig = DefaultModelConfig,
    languageConfig: ChatConfig = JavaScriptConfig
  ) {
    super(description, examples, modelConfig);
    this.languageConfig = languageConfig;
    this.promptConfig = {
      inputPrefix: languageConfig.userName + ":",
      inputPostfix: "",
      outputPrefix: languageConfig.botName + ":",
      outputPostfix: "",
      descriptionPrefix: "",
      descriptionPostfix: "",
      newLineOperator: languageConfig.newLineOperator,
    };
  }
}