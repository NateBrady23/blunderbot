interface OnMessageHandlerInput {
  message: string;
  userLogin: string;
  displayName: string;
  isOwner: boolean;
  isMod: boolean;
  isSub: boolean;
  channelPointsCustomRewardId: string | null;
}
