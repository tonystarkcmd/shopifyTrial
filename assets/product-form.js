if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cart = document.querySelector('cart-notification');
      this.cartDrawer = document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');
      if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);
      let sectionsArr = [];
      if (this.cart) {
        sectionsArr.push(this.cart.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        this.cart.setActiveElement(document.activeElement);
      }
      if (this.cart) {
        sectionsArr.push(this.cartDrawer.getSectionsToRender().map((section) => section.id));
      }
      formData.append('sections', sectionsArr.join(','));
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);

            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');
          if (quickAddModal) {
            document.body.addEventListener('modalClosed', () => {
              setTimeout(() => { 
                this.cart.renderContents(response);
                this.cartDrawer.renderContents(response);
              });
            }, { once: true });
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
            this.cartDrawer.renderContents(response);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (this.cartDrawer && this.cartDrawer.classList.contains('is-empty')) this.cartDrawer.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
// Sayantan TW code start
          $.ajax({
            type: 'GET',
            url: '/cart.js',
            dataType: 'json',
            success: function(cart){
             // UTM UPSELL START -----------------------------------------------------------
              let utmParmsObject = JSON.parse(localStorage.getItem("occ-utm"));
              if ((utmParmsObject?.params?.source?.toLowerCase() == "test" && utmParmsObject?.params?.medium?.toLowerCase() == "timebound" && utmParmsObject?.params?.campaign?.toLowerCase() == "upselling")
                 || (utmParmsObject?.params?.medium?.toLowerCase() == "ig")
                 || (utmParmsObject?.params?.medium?.toLowerCase() == "fb")){
                 let cartlength = cart.items;
              let flagfalse = 0;
              // global variable
              console.log("cart yo",cart.items);
              for(i=0; i<cartlength.length; i++){
                console.log("cart yo",cart.items[i].id);
                if (cart.items[i].id == 42017809924282) {
                  flagfalse = 1;
                  break;
                } else {
                  flagfalse = 0;
                }
              }


                if (flagfalse == 0) {
                  UTM_upsell();
                  $('#main_div_UTMUpsell').css('display', 'block');
                  try {
                    document.querySelector('#cart-notification').classList.remove('active');
                    document.querySelector('#cart-drawer').classList.add('active');
                  } catch (timeBoundOfferErr) {
                    console.log(timeBoundOfferErr);
                  }
              } else {
                  // console.log("else flag");
              }
             }
              // UTM UPSELL END -----------------------------------------------------------
              // console.log("cart: ", cart);
              // $('#vc_bn_count').html(cart.item_count + ` Item(s)`);
            },
            error: function(err){
              console.log("Onerror: ", err);
            }
          });
// Sayantan TW code end 
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}
