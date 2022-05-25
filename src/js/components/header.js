import {
  el,
  mount
} from "redom";

export function renderHeader() {
  const element = el('header.header', el('.header__container', el('span.header__logo', 'Coin.')));
  return mount(document.body, element);
}

export function renderHeaderWithMenu() {
  renderHeader();

  const headerMenuList = createHeaderMenu();
  document.querySelector('.header__container').append(headerMenuList);

  const links = ['/cash-machines', '/accounts', '/currency', '/'];
  const items = document.querySelectorAll('.menu__item a');

  for (let i = 0; i <= links.length && i <= items.length - 1; i++) {
    items[i].setAttribute('href', links[i]);
  }
}

function createHeaderMenu() {
  const list = ['ATMs', 'Accounts', 'Currency', 'Logout'];
  return el(
    'ul.menu',
    list.map((item) => el('li.menu__item', el('a', item))));
}
