import { DefaultModelConfig, PromptEngine } from "./PromptEngine";
import { Interaction, IModelConfig, IChatConfig } from "./types";

export const DefaultChatConfig: IChatConfig = {
  userName: "USER",
  botName: "BOT",
  newLineOperator: "\n",
};

export class ChatEngine extends PromptEngine {
  languageConfig: IChatConfig;

  constructor(
    description: string = "",
    examples: Interaction[] = [],
    modelConfig: IModelConfig = DefaultModelConfig,
    languageConfig: IChatConfig = DefaultChatConfig
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