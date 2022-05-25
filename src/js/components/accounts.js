import {
  el
} from 'redom';
import {
  renderHeaderWithMenu
} from './header.js';
import {
  renderPageTitle,
  createAccount
} from './view.js';
import {
  isMobileMenu,
  dragAndDrop
} from './functions.js';
import '../../../node_modules/focus-visible/dist/focus-visible.min.js';
import '../../scss/main.scss';
import {
  Select
} from './select.js';
import {
  sortAccounts
} from './sort.js';
import {
  Chart,
  registerables
} from 'chart.js';

Chart.register(...registerables);

const {
  parse,
  format
} = require('date-fns');
const {
  en,
  ru
} = require('date-fns/locale');

export async function renderAccountsPage() {
  const token = sessionStorage.getItem('token');

  document.body.textContent = '';
  renderHeaderWithMenu();

  document.querySelector('a[href="/accounts"]').classList.add('is-active');

  renderPageTitle('body', 'Your accounts');

  const select = el('.select');
  document.querySelector('.container__top').append(select);

  let sort;

  const selectContent = new Select('.select', {
    placeholder: 'Sort',
    data: [{
        value: 'by-number',
        text: 'By number'
      },
      {
        value: 'by-balance',
        text: 'By balance'
      },
      {
        value: 'by-last-transaction',
        text: 'By last transaction'
      }
    ],
    onSelect(item) {
      sort = item.value;

      if (result.payload) {
        if (sort === 'by-number') {
          result.payload.sort(sortAccounts('account'));
          renderAccounts();
        }
        if (sort === 'by-balance') {
          result.payload.sort(sortAccounts('balance'));
          renderAccounts();
        }
        if (sort === 'by-last-transaction') {
          result.payload.sort(sortAccounts(`transactions[0].date`));
          renderAccounts();
        }
      }
    }
  });

  const btn = el('button.btn.plus', 'Create new account');
  document.querySelector('.container__top').append(btn);
  const containerBottom = el('.container__bottom');
  document.querySelector('.container').append(containerBottom);

  // Make skeletons
  const skeleton1 = el('.account.skeleton');
  const skeleton2 = el('.account.skeleton');
  const skeleton3 = el('.account.skeleton');
  const skeleton4 = el('.account.skeleton');
  const skeleton5 = el('.account.skeleton');
  const skeleton6 = el('.account.skeleton');
  document.querySelector('.container__bottom').prepend(skeleton1);
  document.querySelector('.container__bottom').prepend(skeleton2);
  document.querySelector('.container__bottom').prepend(skeleton3);
  document.querySelector('.container__bottom').prepend(skeleton4);
  document.querySelector('.container__bottom').prepend(skeleton5);
  document.querySelector('.container__bottom').prepend(skeleton6);

  // Show the list of accounts
  const accounts = await fetch('http://localhost:5000/accounts', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${token}`
    }
  });
  const result = await accounts.json();

  function renderAccounts() {
    document.querySelector('.container__bottom').textContent = '';

    result.payload.forEach(el => {
      let account;

      if (el.transactions[0]) {
        const date = el.transactions[0].date.slice(0, 10);
        const parsedDate = parse(date, "yyyy-MM-dd", new Date(), {
          locale: en,
        });

        const dateFormat = `${
            format(parsedDate, "dd MMMM yyyy", {
              locale: en,
            })
          }`;

        account = createAccount(el.account, el.balance, dateFormat);
      } else {
        account = createAccount(el.account, el.balance);
      }

      document.querySelector('.container__bottom').append(account);
    });
  }

  renderAccounts();

  // Create new account
  document.querySelector('button.plus').addEventListener('click', async () => {
    const res = await fetch('http://localhost:5000/create-account', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`
      }
    });

    const data = await res.json();
    location.reload();
  });

  isMobileMenu();
  dragAndDrop('.container__bottom');
}
