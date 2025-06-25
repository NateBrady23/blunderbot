interface OnMessageHandlerInput {
  message: string;
  userLogin: string;
  displayName: string;
  isOwner: boolean;
  isBot: boolean;
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

interface OnSubscriptionMessageEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  tier: string;
  message: {
    text: string;
    emotes: Array<{
      begin: number;
      end: number;
      id: string;
    }>;
  };
  cumulative_months: number;
  streak_months: number | null;
  duration_months: number;
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

interface ChatSettings {
  broadcaster_id: string;
  slow_mode: boolean;
  slow_mode_wait_time: number | null;
  follower_mode: boolean;
  follower_mode_duration: number;
  subscriber_mode: boolean;
  emote_mode: boolean;
  unique_chat_mode: boolean;
  non_moderator_chat_delay: boolean;
  non_moderator_chat_delay_duration: number;
}

interface UpdateChatSettings {
  slow_mode?: boolean;
  slow_mode_wait_time?: number | null;
  follower_mode?: boolean;
  follower_mode_duration?: number | null;
  subscriber_mode?: boolean;
  emote_mode?: boolean;
  unique_chat_mode?: boolean;
  non_moderator_chat_delay?: boolean;
  non_moderator_chat_delay_duration?: number | null;
}

interface PollData {
  id: string;
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_login: string;
  title: string;
  choices: Array<{
    id: string;
    title: string;
    votes: number;
    channel_points_votes: number;
    bits_votes: number;
  }>;
  bits_voting_enabled: boolean;
  bits_per_vote: number;
  channel_points_voting_enabled: boolean;
  channel_points_per_vote: number;
  status: string;
  duration: number;
  started_at: string;
}

interface CreatePoll {
  title: string;
  choices: Array<{
    title: string;
  }>;
  channel_points_voting_enabled?: boolean;
  channel_points_per_vote?: number;
  duration: number;
}

interface OnChannelPointsCustomRewardRedemptionEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  user_input: string;
  reward: {
    id: string;
    title: string;
    prompt: string;
    cost: number;
  };
}

interface OnBanEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  moderator_user_id: string;
  moderator_user_login: string;
  moderator_user_name: string;
  reason: string;
  banned_at: string;
  ends_at: string;
  is_permanent: boolean;
}
