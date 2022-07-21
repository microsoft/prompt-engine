export type Prompt = string;
export type Context = string;
export type Dialog = string;

export interface IPromptEngine {
  buildContext: () => Context;
  buildPrompt: (naturalLanguage: string) => Prompt;
}

export interface Interaction {
  input: string;
  response: string;
}

export interface IModelConfig {
  maxTokens: number;
}

export interface IPromptConfig {
  modelConfig: IModelConfig;
  descriptionPrefix: string;
  descriptionPostfix: string;
  inputPrefix: string;
  inputPostfix: string;
  outputPrefix: string;
  outputPostfix: string;
  newlineOperator: string;
}

export interface ICodePromptConfig {
  modelConfig: IModelConfig;
  commentOperator: string;
  closeCommentOperator: string;
  newlineOperator: string;
}

export interface IChatConfig {
  modelConfig: IModelConfig;
  userName: string;
  botName: string;
  newlineOperator: string;
}
