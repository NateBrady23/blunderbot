async function soundboardMenu() {
  let section = document.createElement('section');
  let soundboard = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEYS.SOUNDBOARD)
  );
  section.classList.add('soundboard');
  section.innerHTML = `
    <a href="#">Soundboard</a>
    <div role="group" class="blunderbot-group" style="width: 500px; margin-left: -200px;">
    ${soundboard
      .map((sound) => {
        return `
        <a href="#" class="send-command" data-command="!sound ${sound}">${sound}</a>
      `;
      })
      .join('')}
    </div>
  `;
  document.querySelector('#topnav').appendChild(section);
}

void soundboardMenu();
