const userOpenAIConfig: UserOpenAiConfig = {
  enabled: true,
  apiKey: 'sk-your-key',
  ttsModel: 'tts-1',
  imageModel: 'dall-e-3',
  chatModel: 'gpt-4-1106-preview',
  textModerationModel: 'text-moderation-stable',
  // BlunderBot's instructions to the OpenAI chat model
  baseSystemMessage:
    "From now on, you are Nate Brady's creation: BlunderBot, Created to assist Nate",
  // If an image prompt starts with any of these, BlunderBot will edit the image using a .png in the public/images/edits directory.
  // For example, "nate playing chess" will use the public/images/edits/nate.png file to edit the image.
  imageEdits: ['nate'],
  // Voices available for BlunderBut. The first voice in the list is the default.
  voices: ['onyx', 'alloy', 'echo', 'fable', 'nova', 'shimmer'],
  // Fix some common mispronunciations
  pronunciations: [['lichess', 'lee-chess']],
  // The number of messages to remember for the !chat command before it starts
  // deleting old messages. If 0, blunderbot won't have any memory of previous conversations.
  memoryCount: 50
};

export default userOpenAIConfig;
