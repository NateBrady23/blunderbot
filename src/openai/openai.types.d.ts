interface OpenAiChatMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

type OpenAiVoiceOptions =
  | 'alloy'
  | 'echo'
  | 'fable'
  | 'onyx'
  | 'nova'
  | 'shimmer';
