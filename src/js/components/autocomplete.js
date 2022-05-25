import {
  el
} from 'redom';

export function createAutocomplete(selector, array) {
  selector.addEventListener('input', () => {
    deleteListNumbers();

    if (!selector.value.trim()) return;

    if (selector.value == 0) {
      deleteAllLists();
    }

    const list = el('ul.autocomplete');

    for (const number of array) {
      const li = el('li.autocomplete__item', `${number}`, {
        id: `${number}`,
        tabindex: 0
      });
      list.append(li);
    }

    document.querySelector('.trans-form__label--select').append(list);

    document.querySelector('.autocomplete').addEventListener('click', event => {
      event._isClickWithinSearchedList = true;
    });

    document.body.addEventListener('click', (event) => {
      if (event._isClickWithinSearchedList) return;
      deleteListNumbers();
    });

    const items = document.querySelectorAll('.autocomplete__item');

    items.forEach(el => {
      el.addEventListener('click', () => {
        chooseItem(el, selector);
      });
    });
  });

  let currentFocus = -1;

  selector.addEventListener("keydown", e => {
    const list = document.querySelector('.autocomplete');
    let item;

    if (list) {
      item = list.getElementsByTagName('li');
    }

    if (e.keyCode == 40) {
      currentFocus++;
      addActive(item);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(item);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (item) item[currentFocus].click();
      }
    }
  });

  function addActive(item) {
    if (!item) return false;

    removeActive(item);

    if (currentFocus >= item.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (item.length - 1);
    item[currentFocus].classList.add('active');
  }

  function removeActive(item) {
    for (let i = 0; i < item.length; i++) {
      item[i].classList.remove('active');
    }
  }
}

export function deleteListNumbers() {
  const list = document.querySelector('.autocomplete');

  if (!list) return;

  list.remove();
}

export function chooseItem(item, input) {
  input.value = item.textContent;
  deleteListNumbers();
}
