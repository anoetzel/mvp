import {
  el
} from 'redom';
import {
  renderHeaderWithMenu
} from './header.js';
import {
  renderPageTitle,
  createAccountNumberAndBalance,
  createChartBlock,
  createTransactionTable,
  createRow,
  createPagination
} from './view.js';
import {
  isMobileMenu,
  dragAndDrop,
  renameMonths
} from './functions.js';
import '../../../node_modules/focus-visible/dist/focus-visible.min.js';
import '../../scss/main.scss';
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
  ru,
  arMA
} = require('date-fns/locale');

export async function renderAccountHistoryPage() {
  const id = sessionStorage.getItem('account');
  const balance = sessionStorage.getItem('balance');
  const token = sessionStorage.getItem('token');

  document.body.textContent = '';
  renderHeaderWithMenu();

  renderPageTitle('body', 'Balance history');

  const btn = el('a.btn.back', 'Go back');
  document.querySelector('.container__top').append(btn);
  document.querySelector('a.back').addEventListener('click', () => {
    history.back();
  });

  const accountNumber = createAccountNumberAndBalance(id, balance);
  document.querySelector('.container').append(accountNumber);

  const info = el('.history');
  document.querySelector('.container').append(info);

  // Make skeletons
  const skeleton1 = el('.chart.skeleton');
  const skeleton2 = el('.chart.skeleton');
  document.querySelector('.history').prepend(skeleton2);
  document.querySelector('.history').prepend(skeleton1);


  // Get account info
  const response = await fetch(`http://localhost:5000/account/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${token}`
    }
  });

  const dataAccount = await response.json();
  skeleton1.remove();
  skeleton2.remove();

  // Show balance dynamic
  const canvas1 = createChartBlock('dynamic');
  document.querySelector('.history').append(canvas1);

  let twelveMonths = [];
  const transArray = dataAccount.payload.transactions;

  for (let i = transArray.length - 1; i > 0; i--) {
    let date = transArray[i].date.slice(0, 10);
    let parsedDate = parse(date, "yyyy-MM-dd", new Date());
    const now = Date.now();

    if (now - parsedDate < 3.154e+10) {
      let transMonth = `${
          format(parsedDate, "LLLL yyyy", {
            locale: ru
            })
          }`;

      if (transArray[i].to === id) {
        twelveMonths.push({
          month: transMonth,
          amount: transArray[i].amount
        });
      } else {
        twelveMonths.push({
          month: transMonth,
          amount: -transArray[i].amount
        });
      }
    }
  }

  const groupedTwelveMonth = Array.from(twelveMonths.reduce(
      (entryMap, el) => entryMap.set(el.month, [...entryMap.get(el.month) || [], el]),
      new Map()
    ).values())
    .map((el) => {
      let name;
      const posTotal = el.reduce((acc, val) => {
        name = val.month;
        if (val.amount > 0) {
          return acc += val.amount
        }
        return acc;
      }, 0);

      const negTotal = el.reduce((acc, val) => {
        if (val.amount < 0) {
          return acc += val.amount
        }
        return acc;
      }, 0);
      return {
        date: name,
        sum: +(posTotal + negTotal).toFixed(2),
        pos: +posTotal.toFixed(2),
        neg: +negTotal.toFixed(2),
      }
    });

  // Show chart
  const chart1 = document.querySelector('.dynamic .chart__canvas');
  const months = groupedTwelveMonth.map(el => el.date.slice(0, -5)).map(month => {
    const names = renameMonths(month);
    return names;
  });
  const amounts = groupedTwelveMonth.map(el => el.sum);

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

  const myChart1 = new Chart(chart1, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Balance',
        backgroundColor: ['rgb(17, 106, 204)'],
        borderColor: ['rgb(17, 106, 204)'],
        data: amounts
      }]
    },
    options: {
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
          //enabled: false
        },
        chartAreaBorder: {
          borderColor: '#000',
          borderWidth: 1,
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: Math.min(...amounts),
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
            display: false,
            borderColor: '#000'
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
        },
      },
      layout: {
        autoPadding: false,
      }
    },
    plugins: [chartAreaBorder]
  });

  // Show proportion
  const canvas2 = createChartBlock('proportion');
  document.querySelector('.history').append(canvas2);

  const chart2 = document.querySelector('.proportion .chart__canvas');

  const positiveAmount = groupedTwelveMonth.map(el => el.pos);
  const negativeAmount = groupedTwelveMonth.map(el => el.neg);

  const myChart2 = new Chart(chart2, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
          label: 'Expence',
          backgroundColor: ['#fd4E5d'],
          borderColor: ['#fd4E5d'],
          data: negativeAmount
        },
        {
          label: 'Income',
          backgroundColor: ['#76ca66'],
          borderColor: ['#76ca66'],
          data: positiveAmount
        }
      ]
    },
    options: {
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        title: {
          display: true,
          text: 'Ratio of incoming outgoing transactions',
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
          //enabled: false
        },
        chartAreaBorder: {
          borderColor: '#000',
          borderWidth: 1,
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          stacked: true,
          min: Math.min(...amounts),
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
            display: false,
            borderColor: '#000'
          },
          position: 'right',
        },
        x: {
          stacked: true,
          ticks: {
            font: {
              family: 'Work Sans, sans-serif',
              weight: 700,
              size: 20
            }
          },
          grid: {
            display: false,
            borderColor: '#000'
          },
          reverse: true
        },
      },
      layout: {
        autoPadding: false,
      }
    },
    plugins: [chartAreaBorder]
  });

  // Show transaction history
  const table = createTransactionTable();
  document.querySelector('.history').append(table);

  function fillTable(number) {
    let length = transArray.length - number;

    for (let i = length; i >= length - 25; i--) {
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
        row = createRow(transArray[i].from, id, '-', transArray[i].amount, 'red', transMonth);
      }

      document.querySelector('.trans-table tbody').append(row);
    }
  }

  fillTable(1);

  let pagination;

  function createArrayForPagination(number) {
    const father = ['>>']
    const array = Array.from({
      length: number
    }).map((item, index) => item = index + 1).concat(father);
    return array;
  }

  if ((transArray.length - 25) / 25 > 10) {
    const array = createArrayForPagination(10);
    pagination = createPagination(array);
  } else if ((transArray.length - 25) / 25 <= 10) {
    const arrayLength = Math.ceil((transArray.length - 25) / 25);
    const array = Array.from({
      length: arrayLength
    }).map((item, index) => item = index + 1);

    pagination = createPagination(array);
  }

  document.querySelector('.history').append(pagination);
  document.querySelectorAll('.pagination__item')[0].classList.add('is-active');

  // Navigation on pagination
  function addEventToPages() {
    const pages = document.querySelectorAll('.pagination__item');

    pages.forEach(el => {
      el.addEventListener('click', (e) => {
        pages.forEach(el => {
          el.classList.remove('is-active');
        });

        const page = e.currentTarget;
        const pageContent = page.textContent;
        const index = +pageContent - 1;
        const length = index * 25;
        page.classList.add('is-active');

        document.querySelector('tbody').innerHTML = '';

        if (pageContent == 1) {
          fillTable(1);
        } else if (pageContent == '>>') {
          const pagesArray = (Array.from(pages));
          const previousPage = pagesArray[pagesArray.length - 2].textContent;

          const nextPage = +previousPage + 1;
          const index = nextPage - 1;
          const length = index * 25;

          // Creation of a new page in the pagination
          const array = createArrayForPagination(nextPage);
          document.querySelector('.pagination').remove();

          if (array.length > 15) {
            const reducedArray = [...array.slice(0, 5), '...', ...array.slice(-6)];
            pagination = createPagination(reducedArray);
          } else {
            pagination = createPagination(array);
          }

          document.querySelector('.history').append(pagination);

          addEventToPages();
          fillTable(length);

          document.querySelectorAll('.pagination__item').forEach(item => {
            if (item.textContent == nextPage) {
              item.classList.add('is-active');
            }
          });

        } else {
          fillTable(length);
        }
      });
    });
  }
  addEventToPages();

  isMobileMenu();
  dragAndDrop('.history');
}
