const userGiftConfig: UserGifConfig = {
  // If the !gif <phrase> matches one of these keys, use that gif URL instead
  // Use lowercase for the keys
  matches: {
    kaz: 'https://localhost/gifs/kaz.gif',
    party: 'https://localhost/gifs/party.gif',
    ambulance: 'https://localhost/gifs/ambulance.gif'
  },
  // If the !gif <phrase> doesn't match any of the keys above, use this URL instead
  notFound: 'https://localhost/gifs/404.gif'
};

export default userGiftConfig;
