async function blunderBotMenu() {
  const kings = await fetchJson('https://lichess.org/blunderbot/twitch/kings');
  const opps = await fetchJson('https://lichess.org/blunderbot/twitch/opps');
  const crowns = await fetchJson(
    'https://lichess.org/blunderbot/twitch/crowns'
  );

  let section = document.createElement('section');
  section.innerHTML = `
    <a href="#">Blunderbot23</a>
    <div role="group" class="blunderbot-group" style="width: 500px; margin-left: -200px;">
      <a href="https://lichess.org/team/bradys-blunder-buddies/pm-all">Message Team</a>
      <a href="https://dashboard.twitch.tv/u/natebrady23/viewer-rewards/channel-points/rewards" target="_blank">Manage Rewards</a>
      <a href="#" class="reset-bought-squares">Reset Bought Squares</a>
      <hr style="margin: 0;"/>
      <a href="#" data-command="!gpredict" class="send-command">!gpredict</a>
      <a href="#" data-command="!gpredict win" class="send-command">win</a>
      <a href="#" data-command="!gpredict loss" class="send-command">loss</a>
      <a href="#" data-command="!gpredict draw" class="send-command">draw</a>
      <a href="#" data-command="!gpredict cancel" class="send-command">cancel</a>
      <a href="#" data-command="!gpredict lock" class="send-command">lock</a>
      <hr style="margin: 0;"/>
      <a href="#" data-command="!ask" class="send-command">!ask</a>
      <a href="#" class="send-command" data-command="!arena ${
        document.URL
      }" class="blunderbot-arenalink">!arena</a>
      <a href="#" class="send-command" data-command="!bbb">!bbb</a>
      <a href="#" class="send-command" data-command="!bm">!bm</a>
      <a href="#" class="send-command" data-command="!challenge">!challenge</a>
      <a href="#" data-command="!rosen" class="send-command">!rosen</a>
      <a href="#" data-command="!shorts" class="send-command">!shorts</a>
      <a href="#" data-command="!team" class="send-command">!team</a>
      <a href="#" data-command="!youtube" class="send-command">!youtube</a>
      <hr style="margin: 0;"/>
      <a href="#" class="send-command" data-command="!queue list">!queue</a>
      <a href="#" class="send-command" data-command="!queue pop">!queue pop</a>
      <hr style="margin: 0;"/>
      <a href="#" style="display: block">King Faces:</a>
      ${kings
        .map((king) => {
          return `
           <img class="king-face send-command" data-command="!king ${king}" src="https://lichess.org/blunderbot/images/kings/${king}.png" />
           `;
        })
        .join('')}
      <a href="#" class="king-swap">
         King Swap
      </a>
      <a href="#" style="display: block">Opp Faces:</a>
      ${opps
        .map((opp) => {
          return `
           <img class="opp-face send-command" data-command="!opp ${opp}" src="https://lichess.org/blunderbot/images/opponents/${opp}.png" />
           `;
        })
        .join('')}
      <a href="#" style="display: block">Crowns:</a>
      ${crowns
        .map((crown) => {
          return `
           <img class="crown-select send-command" data-command="!crown ${crown}" src="https://lichess.org/blunderbot/images/crowns/${crown}.png" />
           `;
        })
        .join('')}
       <img class="send-command" style="width: 20px; margin-bottom: 25px;" data-command="!crown reset" src="https://lichess.org/blunderbot/images/other/No_sign.svg" />
      <hr style="margin: 0;"/>
      <a href="#" class="send-command" data-command="!live">
         Start Stream
      </a>
      <a href="#" class="end-stream">
         End Stream
      </a>
      <a href="#" class="send-command" data-command="!autochat on">
         Autochat On
      </a>
      <a href="#" class="send-command" data-command="!autochat off">
         Autochat off
      </a>
      <form>
        <input type="text" id="owner-command" placeholder="!command" />
      </form>
    </div>
  `;
  document.querySelector('#topnav').appendChild(section);

  document
    .querySelector('.reset-bought-squares')
    .addEventListener('click', removeBoughtSquares);
  document.querySelector('.king-swap').addEventListener('click', function () {
    const currentSwap = localStorage.getItem('swap_king_opp');
    localStorage.setItem(
      'swap_king_opp',
      currentSwap === 'swap' ? '!swap' : 'swap'
    );
    void setKingStyle();
  });
  document
    .querySelector('.end-stream')
    .addEventListener('click', async function () {
      sendCommandByOwner('!end');
      removeBoughtSquares();
    });
}

function commandInput() {
  const versusUserNode = document.querySelector(
    '#main-wrap > main > div > div.ruser-top.ruser.user-link > a'
  );
  let versusUser;
  if (versusUserNode) {
    const texts = versusUserNode.textContent.split(' ');
    versusUser = texts[texts.length - 1];
  }

  const commandInputDiv = document.createElement('div');
  commandInputDiv.classList.add('command-input-wrapper');
  commandInputDiv.innerHTML = `
    <form class="command-input">
        <input type="text" id="owner-command" placeholder="!command" autocomplete="off"/>
    </form>
  `;
  if (versusUser) {
    commandInputDiv.innerHTML += `
      <button class="send-command" data-command="!rating ${versusUser}">Rating</button>
      <button class="send-command" data-command="!opening">Opening</button>
    `;
  }
  body.append(commandInputDiv);
  commandForm = document.querySelector('.command-input');
  commandInput = commandForm.querySelector('input');

  commandForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = commandInput.value;
    commandInput.value = '';
    if (value.startsWith('!remove')) {
      const boughtSquares =
        JSON.parse(
          localStorage.getItem(LOCAL_STORAGE_KEYS.BOUGHT_SQUARES) || {}
        ) || {};
      delete boughtSquares[value.split(' ')[1]];
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.BOUGHT_SQUARES,
        JSON.stringify(boughtSquares)
      );
      document.querySelector(`.bought-square.${value.split(' ')[1]}`)?.remove();
    } else if (value.startsWith('!')) {
      sendCommandByOwner(value);
    } else {
      blunderBotSay(value);
    }
  });
}

async function loadBlunderBotMenu() {
  await blunderBotMenu();
  commandInput();

  document.querySelectorAll('.mchat__messages li t')?.forEach((node) => {
    node.addEventListener('click', async function (_event) {
      const translation = await translate(node.textContent);
      if (translation) {
        node.innerHTML = `${translation.translation} (${translation.language})`;
      }
    });
  });

  document.querySelectorAll('.send-command').forEach((node) => {
    node.addEventListener('click', function (event) {
      sendCommandByOwner(event.target.getAttribute('data-command'));
    });
  });
}

loadBlunderBotMenu();
