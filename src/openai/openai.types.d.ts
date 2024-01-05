interface OpenAiChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}
