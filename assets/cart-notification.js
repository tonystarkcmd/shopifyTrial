class CartNotification extends HTMLElement {
  constructor() {
    super();

    this.notification = document.getElementById('cart-notification');
    this.header = document.querySelector('sticky-header');
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.notification.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelectorAll('button[type="button"]').forEach((closeButton) =>
      closeButton.addEventListener('click', this.close.bind(this))
    );
  }

  open() {
    this.notification.classList.add('animate', 'active');

    this.notification.addEventListener('transitionend', () => {
      this.notification.focus();
      trapFocus(this.notification);
    }, { once: true });

    document.body.addEventListener('click', this.onBodyClick);

    let utmParmsObject = JSON.parse(localStorage.getItem("occ-utm"));
    if ((utmParmsObject?.params?.campaign?.toLowerCase() == "mmr")
        || (utmParmsObject?.params?.campaign?.toLowerCase() == "wheel of fortune" || utmParmsObject?.params?.campaign?.toLowerCase() == "wheel of fortune " || utmParmsObject?.params?.campaign?.toLowerCase() == "wheel+of+fortune" || utmParmsObject?.params?.campaign?.toLowerCase() == "wheel+of+fortune+")
        || (utmParmsObject?.params?.source?.toLowerCase() == "partner" && utmParmsObject?.params?.medium?.toLowerCase() == "credpay" && utmParmsObject?.params?.campaign?.toLowerCase() == "cred30")
        || (utmParmsObject?.params?.source?.toLowerCase() == "partner" && utmParmsObject?.params?.medium?.toLowerCase() == "phonepe" && utmParmsObject?.params?.campaign?.toLowerCase() == "pp700")
        || (utmParmsObject?.params?.source?.toLowerCase() == "partner" && utmParmsObject?.params?.medium?.toLowerCase() == "paytm" && utmParmsObject?.params?.campaign?.toLowerCase() == "paytm300")
        || (utmParmsObject?.params?.source?.toLowerCase() == "partner" && utmParmsObject?.params?.medium?.toLowerCase() == "phonepe" && utmParmsObject?.params?.campaign?.toLowerCase() == "pp500")
        || (utmParmsObject?.params?.source?.toLowerCase() == "partner" && utmParmsObject?.params?.medium?.toLowerCase() == "phonepe" && utmParmsObject?.params?.campaign?.toLowerCase() == "pp400")
        || (utmParmsObject?.params?.source?.toLowerCase() == "partner" && utmParmsObject?.params?.medium?.toLowerCase() == "phonepe" && utmParmsObject?.params?.campaign?.toLowerCase() == "pp355")
        || (utmParmsObject?.params?.source?.toLowerCase() == "partner" && utmParmsObject?.params?.medium?.toLowerCase() == "phonepe" && utmParmsObject?.params?.campaign?.toLowerCase() == "pp50")
        || (utmParmsObject?.params?.medium?.toLowerCase() == "ig" || utmParmsObject?.params?.medium?.toLowerCase() == "fb")
       ) {
        document.querySelector('#cart-notification').classList.remove('active');
        document.querySelector('#cart-drawer').classList.add('active');
    } else {
        setTimeout(function(){ document.querySelector('#cart-notification').classList.remove('active'); }, 2000); 
    }
  }

  close() {
    this.notification.classList.remove('active');
    document.body.removeEventListener('click', this.onBodyClick);

    removeTrapFocus(this.activeElement);
  }

  renderContents(parsedState) {
      this.cartItemKey = parsedState.key;
      this.getSectionsToRender().forEach((section => {
        document.getElementById(section.id).innerHTML =
          this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      }));

      // if (this.header) this.header.reveal();
      this.open();
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-notification-product',
        selector: `[id^="cart-notification-product-"]`,
      },
      {
        id: 'cart-notification-button'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target !== this.notification && !target.closest('cart-notification')) {
      const disclosure = target.closest('details-disclosure, header-menu');
      this.activeElement = disclosure ? disclosure.querySelector('summary') : null;
      this.close();
    }
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-notification', CartNotification);
