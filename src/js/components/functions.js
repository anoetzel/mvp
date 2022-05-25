export function isMobileMenu() {
  const menuBtn = document.querySelector('.menu');

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      const btn = e.currentTarget;

      if (e.target != btn) return;

      btn.classList.toggle('is-open');
    });
  }
}

export function dragAndDrop(div) {
  const draggables = document.querySelectorAll('.draggable');
  const container = document.querySelector(`${div}`);
  let droppedItem = null;
  let draggedItem = null;

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
      draggable.classList.add('dragging');
      draggedItem = draggable;
    });

    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging');
      draggedItem = null;
    });

    draggable.addEventListener('dragenter', () => {
      if (draggedItem !== droppedItem) {
        droppedItem = draggable;
      }
    });

    draggable.addEventListener('dragleave', () => {
      droppedItem = null;
    });
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    getDragAfterElement(container);
  });

  function getDragAfterElement(container) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(dragging)')];

    if (droppedItem) {
      const draggedIndex = draggableElements.indexOf(draggedItem);
      const droppedIndex = draggableElements.indexOf(droppedItem);

      if (draggedIndex > droppedIndex) {
        draggedItem.parentElement.insertBefore(draggedItem, droppedItem);
      } else {
        draggedItem.parentElement.insertBefore(draggedItem, droppedItem.nextElementSibling);
      }
    }
  }
}

export function renameMonths(month) {
  if (month === 'сентябрь') {
    month = 'sep';
  }
  if (month === 'октябрь') {
    month = 'cot';
  }
  if (month === 'ноябрь') {
    month = 'nov';
  }
  if (month === 'декабрь') {
    month = 'dec';
  }
  if (month === 'январь') {
    month = 'jan';
  }
  if (month === 'февраль') {
    month = 'feb';
  }
  if (month === 'март') {
    month = 'mar';
  }
  if (month === 'апрель') {
    month = 'apr';
  }
  if (month === 'июнь') {
    month = 'jun';
  }
  if (month === 'июль') {
    month = 'jul';
  }
  if (month === 'август') {
    month = 'aug';
  }
  if (month === 'май') {
    month = 'may';
  }

  return month;
}
