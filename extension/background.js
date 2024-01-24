chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url === 'https://lichess.org/twitch-socket')
      return { redirectUrl: 'http://localhost:3000/twitch-socket' };
    if (details.url.startsWith('https://lichess.org/socket.io'))
      return {
        redirectUrl: details.url.replace(
          'https://lichess.org/socket.io',
          'http://localhost:3000/socket.io'
        )
      };
  },
  { urls: ['https://lichess.org/*'] },
  ['blocking']
);
