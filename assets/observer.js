const io = new IntersectionObserver(entries => {

entries.forEach(entry => {
  // Add 'active' class if observation target is inside viewport
  if (entry.intersectionRatio > 0) {

    entry.target.classList.add('lazyloaded-TW');

    let element = entry.target;
    let srcVal = null;
    let bgSrcValD = null;
    let bgSrcValI = null;
    if( element.dataset.src ) {
      console.log('inside src class');
      srcVal = element.dataset.src;
      element.setAttribute("src", element.dataset.src);
      delete(element.dataset.src);
    }
    if(element.classList.contains('bg-lazy')) {
      bgSrcValD = element.dataset.imgdesktop;
      bgSrcValI = element.dataset.imgmobile;
      if (window.innerWidth <= 600) {
          console.log(bgSrcValI);
        element.style.backgroundImage = `url(${bgSrcValI})`;
        
      } else {

        element.style.backgroundImage = `url(${bgSrcValD})`;
      }
    }



  }
  // Remove 'active' class otherwise
  else {
    entry.target.classList.remove('lazyloaded-TW');
  }
})
},{root:null,rootMargin:'0px',threshold:0})

// Declares what to observe, and observes its properties.
const imgElList = document.querySelectorAll('.lazyloadImg-TW');
imgElList.forEach((el) => {
io.observe(el);
})
