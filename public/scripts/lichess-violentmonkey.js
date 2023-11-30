// ==UserScript==
// @name        BlunderBot - lichess.org
// @namespace   Violentmonkey Scripts
// @match       https://lichess.org/*
// @grant       none
// @version     1.0
// @author      -
// @description 11/1/2021, 3:47:20 PM
// ==/UserScript==

function addScriptTag(url) {
  return new Promise((resolve, reject) => {
    var script = document.createElement('script');
    script.addEventListener('load', resolve);
    script.addEventListener('error', reject);
    script.src = url;
    document.head.appendChild(script);
  });
}

function addCss(fileName) {
  var head = document.head;
  var link = document.createElement('link');

  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = fileName;

  head.appendChild(link);
}

async function loadThemAll() {
  await addScriptTag('https://lichess.org/blunderbot/scripts/socket.io.min.js');
  await addScriptTag('https://lichess.org/blunderbot/scripts/utils.js');
  await addScriptTag('https://lichess.org/blunderbot/scripts/index.js');
  await addScriptTag(
    'https://lichess.org/blunderbot/scripts/blunderbot_menu.js'
  );
  await addScriptTag('https://lichess.org/blunderbot/scripts/arena-setup.js');
  await addScriptTag('https://lichess.org/blunderbot/scripts/soundboard.js');
}

addCss('https://lichess.org/blunderbot/css/main.css');

loadThemAll()
  .then(() => {
    console.log('Everything is loaded!');
  })
  .catch((err) => {
    console.log('There was a problem:', err);
  });
