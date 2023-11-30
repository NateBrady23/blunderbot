/**
 * If we're on the Arena page, pre-fill some things for the BBB Title Arena
 */
setTimeout(() => {
  if (document.URL !== 'https://lichess.org/tournament/new') return;
  document.querySelector('#form3-rated').removeAttribute('checked');
  document.querySelector('#form3-name').value = 'BBB Title Arena - Week';
  document
    .querySelector('#form3-clockIncrement > option:nth-child(4)')
    .setAttribute('selected', 'selected');
  document
    .querySelector('#form3-minutes > option:nth-child(9)')
    .setAttribute('selected', 'selected');
  document
    .querySelector('#form3-clockTime > option:nth-child(10)')
    .setAttribute('selected', 'selected');
  document
    .querySelector(
      '#main-wrap > main > div.tour__form.box.box-pad > form > fieldset'
    )
    .classList.add('visible');
  document.querySelector('#form3-conditions_teamMember_teamId').value =
    'bradys-blunder-buddies';
}, 500);
