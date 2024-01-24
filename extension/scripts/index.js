const LOCAL_STORAGE_KEYS = {
  CROWN: 'crown',
  KING: 'king',
  OPPONENT_KING: 'opp_king',
  SWAP_KING: 'swap_king_opp',
  THEME: 'theme',
  THEME_CONFIG: 'themeConfig',
  TITLED_PLAYERS: 'titledPlayers',
  BOUGHT_SQUARES: 'boughtSquares',
  SOUNDBOARD: 'soundboard',
  CURSOR: 'cursor'
};

const MESSAGE_TYPE = {
  ALERT: 'ALERT',
  BOT_SPEAK: 'botSpeak',
  CROWN: 'CROWN',
  HIGHLIGHT: 'HIGHLIGHT',
  GIPHY: 'GIPHY',
  KING: 'KING',
  CURSOR: 'CURSOR',
  LICHESS_CHAT: 'LICHESS_CHAT',
  OPPONENT_KING: 'OPP_KING',
  OPPONENT_RATING: 'OPP_RATING',
  SERVER_MESSAGE: 'serverMessage',
  THEME: 'THEME',
  BOUGHT_SQUARES: 'BOUGHT_SQUARES',
  REFRESH: 'REFRESH'
};

let socket;

// Changing to the current host for possible other support
// socket = io(`https://${window.location.host}/twitch-socket`, {
//   transports: ['polling'],
//   timeout: 200000000
// });
socket = io(`https://${window.location.host}/twitch-socket`, {
  transports: ['polling'],
  timeout: 200000000
});

socket.on('connect', () => console.log('Connected!'));

socket.on(MESSAGE_TYPE.SERVER_MESSAGE, async (data) => {
  console.log(`Message from server received: ${data}`);
  if (data.type === MESSAGE_TYPE.KING) {
    const currKing = localStorage.getItem(LOCAL_STORAGE_KEYS.KING);
    if (currKing === data.king) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.KING, data.king);
    await forceClientsToRefresh();
  } else if (data.type === MESSAGE_TYPE.OPPONENT_KING) {
    const currKing = localStorage.getItem(LOCAL_STORAGE_KEYS.OPPONENT_KING);
    if (currKing === data.king) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.OPPONENT_KING, data.king);
    await forceClientsToRefresh();
  } else if (data.type === MESSAGE_TYPE.CURSOR) {
    const currCursor = localStorage.getItem(LOCAL_STORAGE_KEYS.CURSOR);
    if (currCursor === data.cursor) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURSOR, data.cursor);
    await forceClientsToRefresh();
  } else if (data.type === MESSAGE_TYPE.CROWN) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CROWN, data.crown);
    await forceClientsToRefresh();
  } else if (data.type === MESSAGE_TYPE.THEME) {
    console.log(data.theme);
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, data.theme);
    await forceClientsToRefresh();
  } else if (data.type === MESSAGE_TYPE.HIGHLIGHT) {
    const vals = [-3, -2, -1, 0, 1, 2, 3, 4];
    const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
    if (!!document.querySelector('.orientation-black')) {
      cols.reverse();
    } else {
      rows.reverse();
    }
    const x = vals[cols.indexOf(data.col)];
    const y = vals[rows.indexOf(data.row)];
    document.querySelector('svg.cg-custom-svgs > g').innerHTML +=
      `<circle stroke="${data.color}" stroke-width="0.0625" fill="none" opacity="1" cx="${x}" cy="${y}" r="0.46875" cgHash="681.4815063476562,681.4815063476562,g5,green"></circle>`;
  } else if (data.type === MESSAGE_TYPE.OPPONENT_RATING) {
    const ratingDiv = document.querySelector('div.ruser-top.ruser > rating');
    ratingDiv.innerHTML = data.rating;
  } else if (data.type === MESSAGE_TYPE.BOUGHT_SQUARES) {
    let boughtSquares =
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.BOUGHT_SQUARES)) || {};
    const square = data.square.toLowerCase();
    if (boughtSquares[square]) {
      blunderBotSay(
        `@${data.user} ${square} is already bought. You will have to remind a mod to refund your BlunderBucks.`
      );
    } else {
      boughtSquares[square] = data.user;
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.BOUGHT_SQUARES,
        JSON.stringify(boughtSquares)
      );
      drawBoughtSquares();
      await forceClientsToRefresh();
    }
  } else if (data.type === MESSAGE_TYPE.REFRESH) {
    load();
  } else if (data.type === MESSAGE_TYPE.GIPHY) {
    drawGiphy(data.giphyUrl, data.milliseconds);
  }
});

async function load() {
  addCss('http://localhost:3000/css/main.css');
  addCss('http://localhost:3000/twitch/style.css');

  void setStyle();
  void setCustomStyle();
  void setKingStyle();
  void setCursorStyle();
  drawBoughtSquares();

  fetch('http://localhost:3000/twitch/titles')
    .then((response) => response.json())
    .then((data) =>
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.TITLED_PLAYERS,
        JSON.stringify(data)
      )
    );
  fetch('http://localhost:3000/twitch/themeconfig')
    .then((response) => response.json())
    .then((data) =>
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.THEME_CONFIG,
        JSON.stringify(data)
      )
    );
  fetch('http://localhost:3000/twitch/soundboard')
    .then((response) => response.json())
    .then((data) =>
      localStorage.setItem(LOCAL_STORAGE_KEYS.SOUNDBOARD, JSON.stringify(data))
    );
}

load();
