import {
  el,
  mount
} from 'redom';
import {
  renderHeaderWithMenu
} from './header.js';
import {
  renderPageTitle,
} from './view.js';

import {
  Select
} from './select.js';
import {
  validateExchangeInput
} from './validate-exchange.js';
import {
  isMobileMenu,
  dragAndDrop
} from './functions.js';
import 'simplebar';
import 'simplebar/dist/simplebar.css';

function createBlock(className, title) {
  return el(`.currency.${className}.draggable`, '', {
      draggable: true
    },
    el('h2.currency__title', title),
    el(`ul.${className}__list`));
}

function createBlockExchange(className, title) {
  return el(`.currency.${className}.draggable`, '', {
      draggable: true
    },
    el('h2.currency__title', title));
}

export async function renderCurrencyPage() {
  const token = sessionStorage.getItem('token');

  renderHeaderWithMenu();
  document.querySelector('a[href="/currency"]').classList.add('is-active');

  renderPageTitle('body', 'Currency exchange');

  const container = el('.container__main');
  mount(document.querySelector('.container'), container);

  // Skeletons
  const skeleton1 = el('.currency.skeleton');
  const skeleton2 = el('.currency.feed.skeleton');
  mount(document.querySelector('.container__main'), skeleton1);
  mount(document.querySelector('.container__main'), skeleton2);

  // My currency block
  const response = await fetch('http://localhost:5000/currencies', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  const currenciesData = new Map(Object.entries(data.payload));

  skeleton1.remove();
  skeleton2.remove();

  const blockLeft = el('.container__left.draggable', '', {
    draggable: true
  });
  const myCurrency = createBlock('my-currency', 'Your currencies');
  mount(container, blockLeft);
  mount(document.querySelector('.container__left'), myCurrency);

  currenciesData.forEach(val => {
    if (val.amount > 0) {
      const item = el('li.my-currency__item',
        el('span.my-currency__code', val.code),
        el('span.my-currency__border'),
        el('span.my-currency__amount', val.amount));
      mount(document.querySelector('.my-currency__list'), item);
    }
  });

  // Currency-feed block
  const feed = createBlock('feed', 'Real-time course changes');
  mount(container, feed);

  const feedRes = new WebSocket('ws://localhost:5000/currency-feed');

  feedRes.onmessage = (event) => {
    let data = event.data;

    const str = 'EXCHANGE_RATE_CHANGE';

    if (data.indexOf(str) !== -1) {
      const from = data.slice(39, 42);
      const to = data.slice(50, 53);
      let change = data.slice(-3, -1);
      let rate;
      const regexChange = '-1';
      if (change.match(regexChange)) {
        change = data.slice(-3, -1);
        rate = data.slice(62, -13);
      } else {
        change = data.slice(-2, -1);
        rate = data.slice(62, -12);
      }

      let className;
      if (change === '1') {
        className = 'green';
      }
      if (change === '-1') {
        className = 'red';
      }
      let item = el(`li.feed__item.${className}`,
        el('span.feed__from-to', `${from}/${to}`, {
          'data-exchange': `${from}/${to}`
        }),
        el('span.feed__border'),
        el('span.feed__rate', `${rate}`),
        el('span.feed__triangle'));

      document.querySelector('.feed__list').prepend(item);
    }

    const items = document.querySelectorAll('.feed__item');
    if (items.length > 20) {
      items.forEach((element, index) => {
        if (index > 20) element.remove();
      })
    }
  };

  // Currency exchange block
  const exchange = createBlockExchange('exchange', 'Currency exchange');
  mount(document.querySelector('.container__left'), exchange);

  const res = await fetch(`http://localhost:5000/all-currencies`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${token}`
    }
  });

  const dataCurrencies = await res.json();
  const currencies = dataCurrencies.payload;

  function createFormInfo() {
    return el('form.exchange__form', el('.exchange__top', el('label', 'From',
          el('.select.exchange__select1')),
        el('label', 'to',
          el('.select.exchange__select2'))),
      el('.exchange__bottom',
        el('label', 'Amount',
          el('input.exchange__input', {
            type: 'number'
          }))),
      el('input.btn.exchange__send', {
        type: 'submit',
        value: 'Exchange'
      }));
  }

  const formInfo = createFormInfo();
  mount(document.querySelector('.exchange'), formInfo);

  const select2 = document.querySelector('.exchange__select2');
  const selectData = currencies.map(item => {
    return {
      value: `${item}`,
      text: `${item}`
    }
  });

  let selectedCurrencyFrom,
    selectedCurrencyTo;
  const selectContent1 = new Select('.exchange__select1', {
    placeholder: 'from',
    data: selectData,
    selectedValue: 'BTC',
    onSelect(item) {
      selectedCurrencyFrom = item.value;
    }
  });

  const selectContent2 = new Select('.exchange__select2', {
    placeholder: 'to',
    selectedValue: 'ETH',
    data: selectData,
    onSelect(item) {
      selectedCurrencyTo = item.value;
    }
  });

  const form = document.querySelector('.exchange__form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const input = document.querySelector('.exchange__input');
    const sum = input.value;
    const isSumValid = validateExchangeInput(sum);

    if (input.classList.contains('is-invalid')) {
      input.classList.remove('is-invalid');
    }
    if (input.classList.contains('is-valid')) {
      input.classList.remove('is-valid');
    }

    if (isSumValid === false) {
      input.classList.add('is-invalid');
    } else {
      const buy = await fetch('http://localhost:5000/currency-buy', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: selectedCurrencyFrom,
          to: selectedCurrencyTo,
          amount: sum
        })
      });
      const data = await buy.json();

      if (data.error) {
        input.classList.add('is-invalid');
        console.log(data.error);
      } else {
        input.classList.add('is-valid');

        setTimeout(() => {
          form.reset();
          input.classList.remove('is-valid');
        }, 1000);
      }

      if (data.error === 'Unknown currency code') {
        alert('An invalid currency code was sent or the code is not supported by the system');
      } else if (data.error === 'Invalid amount') {
        alert('The transfer amount is not specified, or it is negative');
      } else if (data.error === 'Not enough currency') {
        alert('There are no funds on the debiting currency account');
      } else if (data.error === 'Overdraft prevented') {
        alert('An attempt to transfer more than is available on the debit account');
      }
    }
  });

  isMobileMenu();
  dragAndDrop('.container__main');
}
