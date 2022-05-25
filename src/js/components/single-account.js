import {
  el
} from 'redom';
import {
  renderHeaderWithMenu
} from './header.js';
import {
  renderPageTitle,
  createAccountNumberAndBalance,
  createNewTransactionBlock,
  createChartBlock,
  createTransactionTable,
  createRow,
} from './view.js';
import {
  isMobileMenu,
  dragAndDrop,
  renameMonths
} from './functions.js';
import '../../../node_modules/focus-visible/dist/focus-visible.min.js';
import '../../scss/main.scss';
import {
  validateTransactionInputs
} from './transaction.js';
import {
  Chart,
  registerables
} from 'chart.js';
import {
  createAutocomplete
} from './autocomplete';

const {
  parse,
  format
} = require('date-fns');
const {
  en,
  ru,
  arMA
} = require('date-fns/locale');

Chart.register(...registerables);

export async function renderSingleAccountPage() {
  const id = sessionStorage.getItem('account');
  const balance = sessionStorage.getItem('balance');
  const token = sessionStorage.getItem('token');

  document.body.textContent = '';
  renderHeaderWithMenu();

  renderPageTitle('body', 'View account');

  const btn = el('a.btn.back', 'Go back');
  document.querySelector('.container__top').append(btn);
  document.querySelector('a.back').addEventListener('click', () => {
    history.back();
  });

  const accountNumber = createAccountNumberAndBalance(id, balance);
  document.querySelector('.container').append(accountNumber);

  const info = el('.info');
  document.querySelector('.container').append(info);

  // Make Skeletons
  const transactionSkeleton = el('.trans-form.skeleton');
  document.querySelector('.info').append(transactionSkeleton);
  const chartSkeleton = el('.chart.skeleton.chart-6');
  document.querySelector('.info').append(chartSkeleton);
  const tableSkeleton = el('.trans-table.skeleton');
  document.querySelector('.info').append(tableSkeleton);

  //Get account info
  const response = await fetch(`http://localhost:5000/account/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${token}`
    }
  });

  const dataAccount = await response.json();
  transactionSkeleton.remove();
  chartSkeleton.remove();
  tableSkeleton.remove();

  // New transaction block
  const transaction = createNewTransactionBlock();
  document.querySelector('.info').append(transaction);

  const form = document.forms.transaction;
  const transTo = form.elements[0];
  const sum = form.elements[1];
  const submit = form.elements[2];
  let transNumbers = [];

  if (localStorage.getItem('transactions')) {
    let savedNumbers = JSON.parse(localStorage.getItem('transactions'));
    transNumbers = savedNumbers;

    createAutocomplete(transTo, transNumbers);
  }

  submit.addEventListener('click', async () => {
    const validation = validateTransactionInputs(transTo.value, sum.value);

    for (let i = 0; i < form.elements.length; i++) {
      form.elements[i].classList.remove('is-invalid');
    }

    if (validation === false) {
      for (let i = 0; i < form.elements.length; i++) {
        form.elements[i].classList.add('is-invalid');
      }
    } else {
      const res = await fetch('http://localhost:5000/transfer-funds', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: id,
          to: transTo.value,
          amount: sum.value
        })
      });
      const data = await res.json();

      if (data.payload !== null) {
        if (transNumbers.length > 0) {
          transNumbers.forEach(number => {
            if (number != transTo.value) {
              transNumbers.push(transTo.value);
            }
          });
        } else {
          transNumbers.push(transTo.value);
        }

        localStorage.setItem('transactions', JSON.stringify(transNumbers));
        for (let i = 0; i < form.elements.length; i++) {
          form.elements[i].classList.add('is-valid');
        }
        setTimeout(() => form.reset(), 600);
        for (let i = 0; i < form.elements.length; i++) {
          form.elements[i].classList.remove('is-valid');
        }
      }

      if (data.error) {
        for (let i = 0; i < form.elements.length; i++) {
          form.elements[i].classList.add('is-invalid');
        }
      }

      if (data.error === 'Invalid account from') {
        alert('The sender\'s account is not specified or does not belong to you');
      } else if (data.error === 'Invalid account to') {
        alert('The crediting account is not specified, or this account does not exist');
      } else if (data.error === 'Invalid amount') {
        alert('The transfer amount is not specified, or it is negative');
      } else if (data.error === 'Overdraft prevented') {
        alert('There are not enough funds in your account');
      }
    }
  });

  // Show balance dynamic
  const canvas = createChartBlock('6-months');
  document.querySelector('.info').append(canvas);

  let sixMonths = [];
  const transArray = dataAccount.payload.transactions;

  if (transArray.length != 0) {
    for (let i = transArray.length - 1; i > 0; i--) {
      let date = transArray[i].date.slice(0, 10);
      let parsedDate = parse(date, "yyyy-MM-dd", new Date());
      const now = Date.now();

      if (now - parsedDate < 1.577e+10) {
        let transMonth = `${
          format(parsedDate, "LLLL", {
            locale: ru
            })
          }`;

        if (transArray[i].to === id) {
          sixMonths.push({
            month: transMonth,
            amount: transArray[i].amount
          });
        } else {
          sixMonths.push({
            month: transMonth,
            amount: -transArray[i].amount
          });
        }
      }
    }
  }

  const groupedSixMonth = Array.from(sixMonths.reduce(
      (entryMap, el) => entryMap.set(el.month, [...entryMap.get(el.month) || [], el]),
      new Map()
    ).values())
    .map((el) => {
      let name;
      const total = el.reduce((acc, val) => {
        name = val.month;
        return acc + val.amount
      }, 0);
      return {
        date: name,
        sum: total
      }
    });

  // Show chart
  const chart = document.querySelector('.chart__canvas');
  const months = groupedSixMonth.map(el => el.date).map(month => {
    const names = renameMonths(month);
    return names;
  });
  const amounts = groupedSixMonth.map(el => el.sum);

  const chartAreaBorder = {
    id: 'chartAreaBorder',
    beforeDraw(chart, args, options) {
      const {
        ctx,
        chartArea: {
          left,
          top,
          width,
          height
        }
      } = chart;
      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.setLineDash(options.borderDash || []);
      ctx.lineDashOffset = options.borderDashOffset;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    }
  };

  const myChart = new Chart(chart, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'none',
        backgroundColor: ['rgb(17, 106, 204)'],
        borderColor: ['rgb(17, 106, 204)'],
        data: amounts
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Balance dynamics',
          align: 'start',
          font: {
            family: 'Work Sans, sans-serif',
            weight: 700,
            size: 20
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        },
        chartAreaBorder: {
          borderColor: '#000',
          borderWidth: 1,
        }
      },
      scales: {
        y: {
          min: 0,
          max: Math.max(...amounts),
          ticks: {
            stepSize: Math.max(...amounts),
            font: {
              family: 'Ubuntu',
              weight: 500,
              size: 20
            }
          },
          grid: {
            display: false
          },
          position: 'right',
        },
        x: {
          ticks: {
            font: {
              family: 'Work Sans, sans-serif',
              weight: 700,
              size: 20
            }
          },
          grid: {
            display: false
          },
          reverse: true
        }
      },
      layout: {
        autoPadding: false,
      }
    },
    plugins: [chartAreaBorder]
  });

  // Show transaction history
  const table = createTransactionTable();
  document.querySelector('.info').append(table);

  if (transArray.length != 0) {
    for (let i = transArray.length - 1; i >= transArray.length - 10; i--) {
      let receiverIsOwner;
      let date = transArray[i].date.slice(0, 10);
      let parsedDate = parse(date, "yyyy-MM-dd", new Date());
      let transMonth = `${
          format(parsedDate, "dd.MM.yyyy")
          }`;

      if (transArray[i].to === id) {
        receiverIsOwner = true;
      } else {
        receiverIsOwner = false;
      }

      let row;
      if (receiverIsOwner) {
        row = createRow(transArray[i].from, id, '+', transArray[i].amount, 'green', transMonth);
      } else {
        row = createRow(transArray[i].from, transArray[i].to, '-', transArray[i].amount, 'red', transMonth);
      }

      document.querySelector('.trans-table tbody').append(row);
    }
  }

  isMobileMenu();

  dragAndDrop('.info');
}
