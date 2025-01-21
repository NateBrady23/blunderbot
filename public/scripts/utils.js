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
             background-image: url('https://localhost/images/themes/${theme}/${color}/${piece}.png') !important;
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
             background-image: url('https://localhost/images/themes/${theme}/${color[0]}/${piece[0]}.png') !important;
          }
        `;
        }
      });
    });
  }

  styleTag.innerHTML += `
    #board,
    .is2d cg-board::before {
      background-image: ${
        themeConfig[theme]?.boardExists
          ? `url('https://localhost/images/themes/${theme}/board.png') !important`
          : `url('https://lichess1.org/assets/_1FzRvx/images/board/svg/brown.svg') !important`
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
    console.log(cursor);

    if (cursor) {
      styleTag.innerHTML += `
        cg-board {
          cursor: url('https://localhost/images/cursors/${cursor}'), default !important;
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
                ? `url('https://localhost/images/themes/${theme}/${oppColor}/crown.png'),`
                : ''
            }
            url('https://localhost/images/${swapped ? 'kings' : 'opponents'}/${
              swapped ? king : opponent
            }') !important;}
      `;
    }

    // Draw my king and crown based on the orientation of the board.
    const crownURL = crown
      ? `url('https://localhost/images/crowns/${crown}')`
      : `url('https://localhost/images/themes/${theme}/${myColor}/crown.png')`;

    styleTag.innerHTML += `
      .piece.${myColor[0]}k,
      .analyse__board .orientation-${myColor} .king.${myColor},
      .is2d .puzzle .orientation-${myColor} .king.${myColor},
      .playing .is2d .orientation-${myColor} .king.${myColor} {
        background-image:
          ${crownURL},
          url('https://localhost/images/${swapped ? 'opponents' : 'kings'}/${
            swapped ? opponent : king
          }') !important
      }
    `;

    head.appendChild(styleTag);
  });
}

// shape is a key color mapping
shapeTimeout = null;
async function drawShapeOverBoard(shape, milliseconds = 5000) {
  clearTimeout(shapeTimeout);
  removeShapeOverBoard();
  const boardNode = document.querySelector('cg-board');
  if (!boardNode) return;
  while (Object.keys(shape).length) {
    // get a random element from the object
    const key =
      Object.keys(shape)[Math.floor(Math.random() * Object.keys(shape).length)];
    const div = document.createElement('div');
    div.innerHTML = `<div class="above-board  no-orientation-${key} shape-over-board" style="background: ${shape[key]}"></div>`;
    boardNode.append(div);
    // remove the element from the object
    delete shape[key];
    await sleep(100);
  }
  shapeTimeout = setTimeout(() => {
    removeShapeOverBoard();
  }, milliseconds);
  // Redraw the bought squares on top of the shape
  drawBoughtSquares();
}

function removeShapeOverBoard() {
  document.querySelectorAll('.shape-over-board').forEach((node) => {
    node.remove();
  });
}

async function drawBoughtSquares() {
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
        div.innerHTML = `<div class="above-board rotate45 ${key} bought-square">${boughtSquares[key]}</div>`;
        boardNode.append(div);
      });
    }
  } catch (e) {
    console.log('Trouble in drawBoughtSquares()');
    console.log(e);
  }
  updateBoughtSquares();
}

// Some change has been made to the lichess UI that causes the
// cg-board element to be replaced with a new one after initial load.
// This observer will redraw the bought squares when this happens.
function observeBoardReplacement() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName.toLowerCase() === 'cg-board') {
            drawBoughtSquares();
          }
        });
      }
    });
  });

  const parentNode = document.body || document.documentElement;
  observer.observe(parentNode, { childList: true, subtree: true });
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
  message = message.split('');
  document.querySelector('#dialog')?.remove();
  const dialogDiv = document.createElement('div');
  dialogDiv.id = 'dialog';
  dialogDiv.innerHTML =
    '<img src="http://localhost:3000/images/other/blunderbot-dialogue.png" />';
  document.querySelector('body')?.prepend(dialogDiv);
  let accented = false;
  for (let i = 0; i < message.length; i++) {
    (function (i) {
      setTimeout(function () {
        if (message[i] === '{') {
          accented = true;
          dialogDiv.innerHTML += '<span class="accent"></span>';
        } else if (message[i] === '}') {
          accented = false;
        } else if (accented) {
          // Insert the character 7 characters from the end of the string
          dialogDiv.innerHTML =
            dialogDiv.innerHTML.slice(0, -7) +
            message[i] +
            dialogDiv.innerHTML.slice(-7);
        } else {
          dialogDiv.innerHTML += message[i];
        }
        if (i === message.length - 1) {
          const arrowDiv = document.createElement('div');
          arrowDiv.id = 'arrow';
          dialogDiv.prepend(arrowDiv);
        }
      }, 50 * i);
    })(i);
  }
  setTimeout(() => {
    document.querySelector('#dialog')?.remove();
  }, milliseconds);
}

/**
 * Format !command args
 *   meaning include the `!`
 * @param command
 * @returns {Promise<void>}
 */
async function sendCommandByOwner(command) {
  await apiPost('https://localhost/twitch/command', { command });
}

/**
 * Sends a message back to the server to send a REFRESH to all connected clients
 * @returns {Promise<void>}
 */
async function forceClientsToRefresh() {
  await apiPost('https://localhost/twitch/force-clients-refresh', {});
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
  const res = await apiPost('https://localhost/openai/translate', {
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
