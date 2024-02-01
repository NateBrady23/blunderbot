interface OnMessageHandlerInput {
  message: string;
  userLogin: string;
  displayName: string;
  isOwner: boolean;
  isMod: boolean;
  isSub: boolean;
  isVip: boolean;
  isFounder: boolean;
  isHypeTrainConductor: boolean;
  channelPointsCustomRewardId: string | null;
}

// https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/#channelchatmessage
interface OnChatMessageEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  chatter_user_id: string;
  chatter_user_login: string;
  chatter_user_name: string;
  message_id: string;
  message: {
    text: string;
    fragments: Array<{
      type: string;
      text: string;
      cheermote: null;
      emote: null;
      mention: null;
    }>;
  };
  color: string;
  badges: Array<{
    set_id: string;
    id: string;
    info: string;
  }>;
  message_type: string;
  cheer: null;
  reply: null;
  channel_points_custom_reward_id: null;
}

interface OnCheerEvent {
  is_anonymous: boolean;
  user_id: string | null;
  user_login: string | null;
  user_name: string | null;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  message: string;
  bits: number;
}

interface OnFollowEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  followed_at: string;
}

interface OnHypeTrainBeginEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  total: number;
  progress: number;
  goal: number;
  top_contributions: Array<{
    user_id: string;
    user_login: string;
    user_name: string;
    type: string;
    total: number;
  }>;
  last_contribution: {
    user_id: string;
    user_login: string;
    user_name: string;
    type: string;
    total: number;
  };
  level: number;
  started_at: string;
  expires_at: string;
}

interface OnHypeTrainProgressEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  level: number;
  total: number;
  progress: number;
  goal: number;
  top_contributions: Array<{
    user_id: string;
    user_login: string;
    user_name: string;
    type: string;
    total: number;
  }>;
  last_contribution: {
    user_id: string;
    user_login: string;
    user_name: string;
    type: string;
    total: number;
  };
  started_at: string;
  expires_at: string;
}

interface OnRaidEvent {
  from_broadcaster_user_id: string;
  from_broadcaster_user_login: string;
  from_broadcaster_user_name: string;
  to_broadcaster_user_id: string;
  to_broadcaster_user_login: string;
  to_broadcaster_user_name: string;
  viewers: number;
}

interface OnStreamOnlineEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  type: string;
  started_at: string;
}

interface OnSubscribeEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  tier: string;
  is_gift: boolean;
}

interface OnSubscriptionGiftEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  total: number;
  tier: string;
  cumulative_total: number | null;
  is_anonymous: boolean;
}
