const head = document.querySelector('head');
const body = document.querySelector('body');

function isLichess() {
  return window.location.hostname === 'lichess.org';
}

function isChessCom() {
  return window.location.hostname === 'www.chess.com';
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

async function setStyle() {
  const styleTag = document.createElement('style');
  const titledPlayers = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEYS.TITLED_PLAYERS) || '[]'
  );

  // Adds the current lichess user's name as a class so we can add the title by name
  const headerUser = document.querySelector(
    'header .dasher a#user_tag.toggle.link'
  );
  headerUser?.classList.add(headerUser.innerText);

  for (let i = 0; i < titledPlayers.length; i++) {
    const player = titledPlayers[i][0];
    const title = titledPlayers[i][1];
    styleTag.innerHTML += `
      header .dasher a#user_tag.toggle.${player}::before,
      a.user-link:not(.text)[href="/@/${player}"]::before,
      a.user-link[data-href="/@/${player}"] span.name::before,
      a[data-pt-pos="s"][href="/@/${player}"]::before,
      span.user-link[data-href="/@/${player}"]::before {
        content: '${title} ';
        color: #bf811d;
        font-weight: bold;
      }
    `;
  }

  head.appendChild(styleTag);
}

async function setCustomStyle() {
  // Remove the style if it already exists
  document.querySelector('#custom-style')?.remove();

  const styleTag = document.createElement('style');
  styleTag.id = 'custom-style';

  const theme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) || 'normal';

  const themeConfig = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEYS.THEME_CONFIG) || '[]'
  );

  if (isLichess()) {
    const colors = ['white', 'black'];
    const pieces = ['pawn', 'rook', 'bishop', 'knight', 'queen'];

    colors.forEach((color) => {
      pieces.forEach((piece) => {
        if (themeConfig[theme][color][piece]) {
          styleTag.innerHTML += `
          .is2d .${piece}.${color} {
             background-image: url('https://lichess.org/blunderbot/images/themes/${theme}/${color}/${piece}.png') !important;
          }
        `;
        }
      });
    });
  }

  if (isChessCom()) {
    const colors = [
      ['white', 'w'],
      ['black', 'b']
    ];
    const pieces = [
      ['pawn', 'p'],
      ['rook', 'r'],
      ['bishop', 'b'],
      ['knight', 'n'],
      ['queen', 'q']
    ];

    colors.forEach((color) => {
      pieces.forEach((piece) => {
        if (themeConfig[theme][color[0]][piece[0]]) {
          styleTag.innerHTML += `
          .piece.${color[1]}${piece[1]} {
             background-image: url('https://lichess.org/blunderbot/images/themes/${theme}/${color[0]}/${piece[0]}.png') !important;
          }
        `;
        }
      });
    });
  }

  styleTag.innerHTML += `
    #board,
    .brown .is2d cg-board::before {
      background-image: ${
        themeConfig[theme]?.boardExists
          ? `url('https://lichess.org/blunderbot/images/themes/${theme}/board.png')`
          : `url('https://lichess1.org/assets/_1FzRvx/images/board/svg/brown.svg')`
      };
    }
  `;

  head.appendChild(styleTag);
}

function isOrientation(color) {
  if (isLichess()) {
    return document.querySelector(`.orientation-${color}`);
  }
  if (isChessCom()) {
    return document.querySelector(`.clock-bottom.clock-${color}`);
  }
}

async function setCursorStyle() {
  window.requestAnimationFrame(async () => {
    console.log('Resetting cursor style');

    // Remove the style if it already exists
    document.querySelector('#cursor-style')?.remove();

    const styleTag = document.createElement('style');
    styleTag.id = 'cursor-style';

    const cursor = localStorage.getItem(LOCAL_STORAGE_KEYS.CURSOR);

    if (cursor) {
      styleTag.innerHTML += `
        * {
          cursor: url('https://lichess.org/blunderbot/images/cursors/${cursor}.cur'), default !important;
        }
      `;
    }

    head.appendChild(styleTag);
  });
}

async function setKingStyle() {
  window.requestAnimationFrame(async () => {
    console.log('Resetting king style');
    let orientationWhite = isOrientation('white');
    let orientationBlack = isOrientation('black');

    // This solved the problem of the board drawing after the page was
    // loaded on lichess
    let count = 0;
    while (!orientationBlack && !orientationWhite) {
      orientationWhite = isOrientation('white');
      orientationBlack = isOrientation('black');
      await sleep(50);
      count++;
      if (count > 12) return;
    }

    // Remove the style if it already exists
    document.querySelector('#king-style')?.remove();

    const styleTag = document.createElement('style');
    styleTag.id = 'king-style';

    const theme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) || 'normal';
    const king = localStorage.getItem(LOCAL_STORAGE_KEYS.KING) || 'cry';
    const opp_king = localStorage.getItem(LOCAL_STORAGE_KEYS.OPPONENT_KING);
    const crown = localStorage.getItem(LOCAL_STORAGE_KEYS.CROWN);
    const myColor = orientationBlack ? 'black' : 'white';
    const oppColor = orientationBlack ? 'white' : 'black';
    const swapped =
      localStorage.getItem(LOCAL_STORAGE_KEYS.SWAP_KING) === 'swap';

    const opponent = opp_king;
    if (opponent) {
      let hasCrown = true;
      if (opponent === 'uncle_sam') {
        hasCrown = false;
      }
      styleTag.innerHTML += `
        .piece.${oppColor[0]}k,
        .analyse__board .orientation-${myColor} .king.${oppColor},
        .is2d .puzzle .orientation-${myColor} .king.${oppColor},
        .playing .is2d .orientation-${myColor} .king.${oppColor} {
          background-image:
            ${
              hasCrown
                ? `url('https://lichess.org/blunderbot/images/themes/${theme}/${oppColor}/crown.png'),`
                : ''
            }
            url('https://lichess.org/blunderbot/images/${
              swapped ? 'kings' : 'opponents'
            }/${swapped ? king : opponent}.png') !important;}
      `;
    }

    if (opponent === 'hans') {
      let [color1, color2] = swapped ? [myColor, myColor] : [myColor, oppColor];
      styleTag.innerHTML += `
        .piece.${color2[0]}k,
       .analyse__board .orientation-${color1} .king.${color2},
       .is2d .puzzle .orientation-${color1} .king.${color2},
       .playing .is2d .orientation-${color1} .king.${color2} {
            animation: shake 4s;
            animation-iteration-count: infinite;
          }
        `;
    }

    if (opponent === 'buttery_flaky') {
      let toggle = true;
      clearInterval(window.buttery_interval);
      window.buttery_interval = setInterval(() => {
        const opp = localStorage.getItem(LOCAL_STORAGE_KEYS.OPPONENT_KING);
        if (opp !== 'buttery_flaky') {
          clearInterval(window.buttery_interval);
          return;
        }
        document.querySelector('#buttery-style')?.remove();
        let background_url = toggle
          ? `https://lichess.org/blunderbot/images/opponents/buttery_flaky.png`
          : `https://lichess.org/blunderbot/images/other/buttery_flaky2.png`;
        toggle = !toggle;
        if (swapped) {
          background_url = `https://lichess.org/blunderbot/images/kings/${king}.png`;
        }
        const styleTag = document.createElement('style');
        styleTag.id = 'buttery-style';
        styleTag.innerHTML += `
        .piece.${oppColor[0]}k,
        .analyse__board .orientation-${myColor} .king.${oppColor},
        .is2d .puzzle .orientation-${myColor} .king.${oppColor},
        .playing .is2d .orientation-${myColor} .king.${oppColor} {
          background-image:
            url('https://lichess.org/blunderbot/images/themes/${theme}/${oppColor}/crown.png'),
            url('${background_url}') !important;}
      `;
        head.appendChild(styleTag);
      }, 5000);
    }

    if (opponent === 'batman') {
      let toggle = true;
      clearInterval(window.batman_interval);
      window.batman_interval = setInterval(() => {
        const opp = localStorage.getItem(LOCAL_STORAGE_KEYS.OPPONENT_KING);
        if (opp !== 'batman') {
          clearInterval(window.batman_interval);
          return;
        }
        document.querySelector('#batman-style')?.remove();
        let background_url = toggle
          ? `https://lichess.org/blunderbot/images/opponents/batman.png`
          : `https://lichess.org/blunderbot/images/other/bat_signal.png`;
        toggle = !toggle;
        if (swapped) {
          background_url = `https://lichess.org/blunderbot/images/kings/${king}.png`;
        }
        const styleTag = document.createElement('style');
        styleTag.id = 'batman-style';
        styleTag.innerHTML += `
        .piece.${oppColor[0]}k,
        .analyse__board .orientation-${myColor} .king.${oppColor},
        .is2d .puzzle .orientation-${myColor} .king.${oppColor},
        .playing .is2d .orientation-${myColor} .king.${oppColor} {
          background-image:
            url('https://lichess.org/blunderbot/images/themes/${theme}/${oppColor}/crown.png'),
            url('${background_url}') !important;}
      `;
        head.appendChild(styleTag);
      }, 5000);
    }

    // Draw my king and crown based on the orientation of the board.
    const crownURL = crown
      ? `url('https://lichess.org/blunderbot/images/crowns/${crown}.png')`
      : `url('https://lichess.org/blunderbot/images/themes/${theme}/${myColor}/crown.png')`;

    styleTag.innerHTML += `
      .piece.${myColor[0]}k,
      .analyse__board .orientation-${myColor} .king.${myColor},
      .is2d .puzzle .orientation-${myColor} .king.${myColor},
      .playing .is2d .orientation-${myColor} .king.${myColor} {
        background-image:
          ${crownURL},
          url('https://lichess.org/blunderbot/images/${
            swapped ? 'opponents' : 'kings'
          }/${swapped ? opponent : king}.png') !important
      }
    `;

    head.appendChild(styleTag);
  });
}

function drawBoughtSquares() {
  try {
    const boardNode = document.querySelector('cg-board');

    if (boardNode) {
      const boughtSquares =
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.BOUGHT_SQUARES)) ||
        {};
      // If we keep drawing over the same squares, it will get blurry
      removeBoughtSquares(false);
      Object.keys(boughtSquares).forEach((key) => {
        const div = document.createElement('div');
        div.innerHTML = `<div class="above-board ${key} bought-square">${boughtSquares[key]}</div>`;
        boardNode.prepend(div);
      });
    }
  } catch (e) {
    console.log('Trouble in drawBoughtSquares()');
    console.log(e);
  }
  updateBoughtSquares();
}

function drawGiphy(url, milliseconds) {
  try {
    let node = document.querySelector('.main-board');
    let className = 'gif-above-board';
    if (!node) {
      className = 'gif-above-all';
      node = document.querySelector('body');
    }
    document.querySelector('.' + className)?.remove();
    const div = document.createElement('div');
    div.innerHTML = `<div class="${className}"><img src="${url}" /></div>`;
    node.prepend(div);
    setTimeout(() => {
      document.querySelector('.' + className)?.remove();
    }, milliseconds);
  } catch (e) {
    console.log('Trouble in drawGiphy()');
    console.log(e);
  }
}

function removeBoughtSquares(removeFromLocalStorage = true) {
  removeFromLocalStorage &&
    localStorage.setItem(LOCAL_STORAGE_KEYS.BOUGHT_SQUARES, null);
  document.querySelectorAll('.bought-square').forEach((node) => {
    node.remove();
  });
}

function blunderBotSay(say) {
  socket.emit('botSpeak', say);
}

function updateBoughtSquares() {
  const data = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEYS.BOUGHT_SQUARES) || '{}'
  );
  socket.emit('updateBoughtSquares', data);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function drawAlert(message, milliseconds) {
  document.querySelector('.blunder-alert')?.remove();
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="blunder-alert">
      <img src="https://lichess.org/blunderbot/images/other/blunderbot.png" />
      <span>${message}</span>
    </div>`;
  document.querySelector('body')?.prepend(div);
  setTimeout(() => {
    document.querySelector('.blunder-alert')?.remove();
  }, milliseconds);
}

/**
 * Format !command args
 *   meaning include the `!`
 * @param command
 * @returns {Promise<void>}
 */
async function sendCommandByOwner(command) {
  await apiPost('https://lichess.org/blunderbot/twitch/command', { command });
}

/**
 * Sends a message back to the server to send a REFRESH to all connected clients
 * @returns {Promise<void>}
 */
async function forceClientsToRefresh() {
  await apiPost(
    'https://lichess.org/blunderbot/twitch/force-clients-refresh',
    {}
  );
}

async function apiPost(url, body) {
  return await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

async function translate(message) {
  const res = await apiPost('https://lichess.org/blunderbot/openai/translate', {
    message
  });
  return await res.json();
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
