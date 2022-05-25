const getTemplate = (data = [], placeholder = 'Placeholder', selectedValue) => {
  const items = data.map(item => {
    let cls = '';
    if (item.value === selectedValue) {
      placeholder = item.text;
      cls = 'selected';
    }
    return `
        <li class="select__item ${cls}" data-type="item" data-value="${item.value}">${item.text}</li>
        `
  })

  return `
    <div class="select__background" data-type="background"></div>
    <div class="select__input" data-type="input"><span data-type="selected">${placeholder}</span></div>
    <div class="select__dropdown" data-simplebar>
        <ul class="select__list">
            ${items.join('')}
        </ul>
    </div>
    `
};

export class Select {
  constructor(selector, options) {
    this.$el = document.querySelector(selector),
      this.options = options,
      this.selectedValue = options.selectedValue,

      this.render(),
      this.setup()
  }

  render() {
    const {
      placeholder,
      data
    } = this.options;
    this.$el.innerHTML = getTemplate(data, placeholder, this.selectedValue);
  }

  setup() {
    this.clickHandler = this.clickHandler.bind(this);
    this.$el.addEventListener('click', this.clickHandler);
    this.$selected = this.$el.querySelector('[data-type="selected"]');
  }

  clickHandler(event) {
    const {
      type
    } = event.target.dataset;

    if (type === 'input') {
      this.toggle();
    } else if (type === 'item') {
      const value = event.target.dataset.value;
      this.select(value);
    } else if (type === 'background') {
      this.close();
    }
  }

  get isOpen() {
    return this.$el.classList.contains('open');
  }

  get currentValue() {
    return this.options.data.find(item => item.value === this.selectedValue);
  }

  select(value) {
    this.selectedValue = value;
    this.$selected.textContent = this.currentValue.text;

    this.$el.querySelectorAll(`[data-type="item"]`).forEach(el => {
      el.classList.remove('selected');
    });
    this.$el.querySelector(`[data-value="${value}"]`).classList.add('selected');
    this.options.onSelect ? this.options.onSelect(this.currentValue) : null;
    this.close();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.$el.classList.add('open');
  }

  close() {
    this.$el.classList.remove('open');
  }

  destroy() {
    this.$el.removeEventListener('click', this.clickHandler);
    this.$el.innerHTML = '';
  }
}
