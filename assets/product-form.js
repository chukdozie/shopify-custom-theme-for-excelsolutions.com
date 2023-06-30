class ProductForm extends HTMLElement {
  constructor() {
    super();   

    this.form = this.querySelector('form');
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
    this.cartNotification = document.querySelector('cart-notification');
  }


  getSectionsToRender() {
    return [
      {
        id: 'es-header-cart',
        section: document.getElementById('es-header-cart').dataset.id,
        selector: '#cart-count-bubble-number'
      },
      {
        id: 'mobile-header',
        section: document.getElementById('mobile-header').dataset.id,
        selector: '#cart-count-bubble-number'
      }
    ];
  }

  onSubmitHandler(evt) {
    evt.preventDefault();
    this.cartNotification.setActiveElement(document.activeElement);
    
    const submitButton = this.querySelector('[type="submit"]');

    submitButton.setAttribute('disabled', true);
    submitButton.classList.add('loading');

    const data = JSON.parse(serializeForm(this.form))

    const body = JSON.stringify({
      ...data,
      sections: this.cartNotification.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig('javascript'), body })
      .then((response) => response.json())
      .then((parsedState) => {
        this.cartNotification.renderContents(parsedState);
        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector);
          if (elementToReplace) {
            elementToReplace.innerHTML = parseInt(elementToReplace.innerHTML) + parseInt(data.quantity)
          } else {
            const element = document.getElementById(section.id).querySelector('#cart-icon-bubble');
            if (section.id === 'ajax-bar') {
              element.innerHTML += `<div id="cart-count-bubble">(<span id="cart-count-bubble-number" aria-hidden="true">${parseInt(data.quantity)}</span>)<span class="visually-hidden">${parseInt(data.quantity)} Items</span>
              </div>`;
            } else {
              element.innerHTML += `<div id="cart-count-bubble" class="cart-mobile-bubble"><span id="cart-count-bubble-number" aria-hidden="true">${parseInt(data.quantity)}</span><span class="visually-hidden">${parseInt(data.quantity)} Items</span>
              </div>`;
            }
          }
         
        }));
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        submitButton.classList.remove('loading');
        submitButton.removeAttribute('disabled');
      });
  }
}

customElements.define('product-form', ProductForm);
