const userGiftConfig: UserGifConfig = {
  // If the !gif <phrase> matches one of these keys, use that gif URL instead
  // Use lowercase for the keys
  matches: {
    kaz: 'https://lichess.org/blunderbot/gifs/kaz.gif',
    party: 'https://lichess.org/blunderbot/gifs/party.gif',
    ambulance: 'https://lichess.org/blunderbot/gifs/ambulance.gif'
  },
  // If the !gif <phrase> doesn't match any of the keys above, use this URL instead
  notFound: 'https://localhost/gifs/404.gif'
};

export default userGiftConfig;
