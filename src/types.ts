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
  descriptionPrefix: string;
  descriptionPostfix: string;
  inputPrefix: string;
  inputPostfix: string;
  outputPrefix: string;
  outputPostfix: string;
  newLineOperator: string;
}

export interface ICodePromptConfig {
  descriptionCommentOperator: string;
  descriptionCloseCommentOperator: string;
  commentOperator: string;
  closeCommentOperator?: string;
  newLineOperator: string;
}

export interface IChatConfig {
  userName: string;
  botName: string;
  newLineOperator: string;
}
