export type Prompt = string;
export type Context = string;

export interface ModelConfig {
	maxTokens: number;
}

export interface IPromptEngine {
	modelConfig: ModelConfig;
	description?: string;
	examples?: Interaction[];
	dialog: Interaction[];
	addInteraction: (interaction: Interaction) => void;
	buildContext: () => Context;
	craftPrompt: (naturalLanguage: string) => Prompt;
}

export interface CodeEngine extends IPromptEngine {
	languageConfig: LanguageConfig;
}

export interface Interaction {
	input: string;
	response: string;
}

export interface ChatConfig extends IPromptEngine {
    chatConfig: ChatConfig;
}

export interface LanguageConfig {
	commentOperator: string;
	commentCloseOperator: string;
	newLineOperator: string;
}

export interface ChatConfig {
    userName: string;
    botName: string;
    newLineOperator: string;
}