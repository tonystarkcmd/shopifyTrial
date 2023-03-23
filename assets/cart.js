class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      // console.log("cart remove event::",this);
      
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      // console.log("Cart remove btn :: ",cartItems);
      cartItems.updateQuantity(this.dataset.index, 0, '' ,this.dataset.productId);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

// class CartThemeMinusButton extends HTMLElement {
//   constructor() {
//     super();
//     this.addEventListener('click', (event) => {
//       // console.log("cart theme minus event::",this);
      
//       event.preventDefault();
//       const cartItems = document.getElementsByTagName('cart-drawer-items')[0];
//       // console.log("this.dataset.productId",this.dataset.productId);
//       const Input_value = parseInt(document.getElementsByClassName(`quantity__inputHi${this.dataset.productId}`)[0].value) - 1;
//       cartItems.updateQuantity(1, Input_value, 'minus' ,this.dataset.productId);
//     });
//   }
// }

// customElements.define('cart-theme-minus-btn', CartThemeMinusButton);

// class CartThemePlusButton extends HTMLElement {
//   constructor() {
//     super();
//     this.addEventListener('click', (event) => {
//       // console.log("cart theme plus event::",this);
      
//       event.preventDefault();
//       const cartItems = document.getElementsByTagName('cart-drawer-items')[0];
//       const Input_value = parseInt(document.getElementsByClassName(`quantity__inputHi${this.dataset.productId}`)[0].value) + 1;
//       cartItems.updateQuantity(1, Input_value, 'plus' ,this.dataset.productId);
//     });
//   }
// }

// customElements.define('cart-theme-plus-btn', CartThemePlusButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    // console.log("cart onChange",event.target.dataset);
    // console.log("cart onChange2",event.target.dataset.index);
    // console.log("cart onChange3",event.target.value);
    // console.log("cart onChange4",document.activeElement.getAttribute('name'));
    // console.log("cart onChange5",event.target.dataset.productId);

    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'),event.target.dataset.productId);
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      }
    ];
  }

  updateQuantity(line, quantity, name, itemproductId) {
    
    // console.log("line",line);
    this.enableLoading(line);
    // console.log('quantity',quantity)
    // console.log('name',name)
    // console.log('itemproductId',itemproductId)
    // $(`.quantity__input${itemproductId}`).attr('value',`${quantity}`);
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        // console.log("parsedState::",parsedState); // this is latest cart value
        /* sayantan's code start */

        // UTM Based Upsell----------------------------------------------------
        let utmParmsObject = JSON.parse(localStorage.getItem("occ-utm"));
         if ((utmParmsObject?.params?.source?.toLowerCase() == "test" && utmParmsObject?.params?.medium?.toLowerCase() == "timebound" && utmParmsObject?.params?.campaign?.toLowerCase() == "upselling")
            || (utmParmsObject?.params?.medium?.toLowerCase() == "ig")
            || (utmParmsObject?.params?.medium?.toLowerCase() == "fb")){
          let flagfalse = 0;
              let cartlength = parsedState.items;
              let counter_session = sessionStorage.getItem("counter");
              for(i=0; i<cartlength.length; i++){
                // console.log("cart yo",cartlength[i].id);
                if (cartlength[i].id == 42017809924282) {
                  flagfalse = 1;
                  break;
                } else if(itemproductId == 7273934258362) {
                  flagfalse = 1;
                  break;
                }
                  else if(counter_session < 1) {
                  flagfalse = 1;
                  break;
                }
                  else {
                    flagfalse == 0;
                  }
              }

              if (flagfalse == 0) {
              // console.log("cart js if");
                setTimeout(function(){
                  $('#main_div_UTMUpsell').css('display','block');
                }, 900);
            } 
              else {
              // console.log("cart js if lese");
                setTimeout(function(){
                  $('#main_div_UTMUpsell').css('display','none');
                }, 900);
            }
        
              setTimeout(function(){
          UTM_upsell();
        }, 1000);
        }    
        // UTM Based Upsell END-------------------------------------------------
        
         let ParseIntLine = parsedState.item_count;
        // $("#vc_bn_count").html(`${ParseIntLine}` + ` Item(s)`);

        // quantity for home and collection page
    //     if(quantity==0 ){
    //       console.log("QTY");
    // $(`.product-form__submit_Cards${ itemproductId }`).css("display", "flex");
    // $(`.Sayantan_pmbtn${ itemproductId }`).css("display", "none");   
    //     }
        
        // quantity for pdp

        
        // if ((window.innerWidth > 1040 ))  {
        // if (/product/.test(window.location.href)){
        //   if(globalProductID == itemproductId && quantity==0 ){
        //     $(".Sayantan_pmbtn").css("display", "none");
        //     $(".prod-btn_sm_new").css("display", "flex");
        //   }
        // }
        // }


        // view cart buy now
   
    //         if ((window.innerWidth < 640 ))  {
    // if (/product/.test(window.location.href)) {
      // console.log("globalProductID::",globalProductID);
      // console.log("line::",globalcount);
      // console.log("quantity::",quantity);
      // console.log("name::",name); 
      // console.log("itemproductId::",itemproductId);
    //   if(globalProductID == itemproductId && quantity==0 ){
    //     $("#smTWviewPro").css("display", "none");
    //     $(".myproduct--form").css("position", "fixed");
    //       $(".prod-btn_sm_new").css("display", "block");
    //        $(".SM_nopadd").css("padding", "16px 15px");
    //         $(".SM_nopadd").css("margin", "0");
    //         $(".row-top").css("padding", "1rem 1.5rem");
    //     $(".Sayantan_pmbtn").css("display", "none");
    //         $(".prod-btn_sm_new button").css("display", "block");
    //   }
    //   else{
    //     $(".Sayantan_pmbtn").css("display", "flex");
    //         $(".prod-btn_sm_new button").css("display", "none");
    //      $("#smTWviewPro").css("display", "flex");
    //       // $(".prod-btn_sm_new button").css("display", "none");
    //   }
    // }
    // else{
    //       if ((window.innerWidth < 640 ))  {
    // if (ParseIntLine>0){
    //   $("#smTWview").css("display", "flex");
    //   $(".prod-btn_sm_new").css("display", "none");
    //   // console.log("ParseIntLine if",);
    // }
    // else{
    //   $("#smTWview").css("display", "none");
    //   // console.log("ParseIntLine else");
    //   $(".prod-btn_sm_new").css("display", "block");
    // }
    //   }
      
    // }
    //         }
    /* sayantan's code end */
        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        console.log("Sections to render :: "+this.getSectionsToRender());
        this.getSectionsToRender().forEach((section => {
          // console.log("Rendering");
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        this.updateLiveRegions(line, parsedState.item_count);
        const lineItem = document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
        }
        this.disableLoading();
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
        this.disableLoading();
      });
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
      lineItemError
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items', CartItems);
// customElements.define('sayantan_btn', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
      }, 300))
    }
  });
};
