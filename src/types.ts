export type Prompt = string;
export type Context = string;

export interface IPromptEngine {
  buildContext: () => Context;
  craftPrompt: (naturalLanguage: string) => Prompt;
}

export interface CodeEngine extends IPromptEngine {	
  languageConfig: PromptConfig;
  examples?: Interaction[];
  dialog: Interaction[];
  addInteraction: (interaction: Interaction) => void;
}

export interface ChatEngine extends IPromptEngine {
  chatConfig: ChatConfig;
  examples?: Interaction[];
  dialog: Interaction[];
  addInteraction: (interaction: Interaction) => void;
}

export interface Interaction {
  input: string;
  response: string;
}

export interface ModelConfig {
  maxTokens: number;
}

export interface PromptConfig {
  inputPrefix: string;
  inputPostfix: string;
  newLineOperator: string;
}

export interface CodePromptConfig {
  commentOperator: string;
  closeCommentOperator?: string;
  newLineOperator: string;
}

export interface ChatConfig {
  userName: string;
  botName: string;
  newLineOperator: string;
}
