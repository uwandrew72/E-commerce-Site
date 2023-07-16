/**
 * This is the js file to implement the client side.
 * It contains the following features:
 * 1. show all items on the home page
 * 2. show detail of one item when click on the card
 * 3. search items by price range, name, category and stock
 * 4. add items to cart
 * 5. show all items in the cart
 * 6. purchase all items in the cart
 * 7. show all transactions for the current user
 * 8. login and sign up
 * 9. log off
 * and some more others
 */
'use strict';
(function() {
  window.addEventListener('load', init);
  const twosec = 2000;

  /**
   * initialize the page, add event listeners to buttons: login,
   * sign up, home, transaction, logoff, search, cart
   * check if the user is logged in at first
   * show all items on the home page
   */
  function init() {
    showAllItems();
    loginCheck();
    id('layout-toggle').addEventListener('click', togglelayout);
    id('login-btn').addEventListener('click', showLogin);
    id('signup-btn').addEventListener('click', showSignUp);
    id('home-btn').addEventListener('click', showHome);
    id('len-btn').addEventListener('click', showlen);
    id('camera-btn').addEventListener('click', showcam);
    id('transaction-btn').addEventListener('click', showTransaction);
    id('logoff-btn').addEventListener('click', logoff);
    id('search-btn').addEventListener('click', search);
    id('transaction-btn').addEventListener('click', showAllTransactions);
    id('cart-btn').addEventListener('click', showCartItems);
    id('option-btn').addEventListener('click', showOptions);
  }

  /**
   * show all items on the home page, called when the page is loaded
   */
  async function showAllItems() {
    try {
      let res = await fetch('/items/all');
      res = await statusCheck(res);
      let items = await res.json();
      let parent = id('home');
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
      for (let item of items) {
        let card = itemCard(item);
        card.querySelector('img').addEventListener('click', showCardDetail);
        card.querySelector('h1').addEventListener('click', showCardDetail);
        parent.appendChild(card);
      }
    } catch (err) {
      showMessage(err);
    }
  }

  /**
   * show all lenses on the home page, called when the page is loaded
   */
  async function showlen() {
    let request = '/search?category=len';
    try {
      let res = await fetch(request);
      res = await statusCheck(res);
      let items = await res.json();
      let parent = id('home');
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
      showcamlen();
      parent.innerHTML = '';
      for (let item of items) {
        let card = itemCard(item);
        card.querySelector('img').addEventListener('click', showCardDetail);
        card.querySelector('h1').addEventListener('click', showCardDetail);
        parent.appendChild(card);
      }
    } catch (err) {
      showMessage(err);
    }
  }

  /**
   * show all camers on the home page, called when the page is loaded
   */
  async function showcam() {
    let request = '/search?category=camera';
    try {
      let res = await fetch(request);
      res = await statusCheck(res);
      let items = await res.json();
      let parent = id('home');
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
      showcamlen();
      parent.innerHTML = '';
      for (let item of items) {
        let card = itemCard(item);
        card.querySelector('img').addEventListener('click', showCardDetail);
        card.querySelector('h1').addEventListener('click', showCardDetail);
        parent.appendChild(card);
      }
    } catch (err) {
      showMessage(err);
    }
  }

  /**
   * generat a card for an item and return it, used by showAllItems
   * @param {Object} item - one item object that contains key information
   * @returns {HTMLElement} the card for the item
   */
  function itemCard(item) {
    let card = gen('div');
    card.classList.add('card');
    card.id = item.iid;
    let img = gen('img');
    img.src = 'img/item/' + item.img;
    img.alt = item.name;
    card.appendChild(img);
    let name = gen('h1');
    name.textContent = item.name;
    card.appendChild(name);
    let price = gen('p');
    price.textContent = '$' + item.price;
    price.classList.add('price');
    card.appendChild(price);
    let spec = gen('p');
    spec.textContent = item.spec;
    card.appendChild(spec);
    let addCart = gen('button');
    addCart.textContent = 'Add to Cart';
    addCart.addEventListener('click', () => {
      addToCart(item.iid);
    });
    card.appendChild(addCart);
    return card;
  }

  /**
   * show card detail, called when click on a card,
   * the event listener is added in showAllItems
   */
  async function showCardDetail() {
    let iid = this.parentNode.id;
    showDetail();
    id('detail').innerHTML = '';
    try {
      let res = await fetch('/detail/' + iid);
      res = await statusCheck(res);
      let item = await res.json();
      addItemDetail(item);
      let inputAmount = id('input-amount');
      inputAmount.setAttribute('type', 'number');
      inputAmount.setAttribute('value', '1');
      let confirmBtn = id('confirm-btn');
      confirmBtn.classList.add('hidden');
      inputAmount.classList.add('hidden');
    } catch (err) {
      showMessage(err);
    }
  }

  /**
   * add item detail to the detail page, called by showCardDetail
   * to add the detail of one item to the detail page
   * @param {Object} item - one item object that contains all the information
   */
  function addItemDetail(item) {
    let parent = id('detail');
    let elements = [
      {tag: 'p', text: item.name},
      {tag: 'p', text: item.spec},
      {tag: 'img', src: 'img/item/' + item.img, alt: item.name},
      {tag: 'p', text: item.info},
      {tag: 'p', text: 'Stock: ' + item.stock},
      {tag: 'p', text: '$' + item.price, class: 'price'},
      {tag: 'button', text: 'Add to Cart', click: () => addToCart(item.iid)},
      {tag: 'button', text: 'Buy Now!', click: toggleUpConfirm},
      {tag: 'input', id: 'input-amount'},
      {tag: 'button', text: 'Confirm', id: 'confirm-btn', click: () => {
        let amount = id('input-amount').value;
        purchaseOne(item.iid, amount);
        showHome();
      }},
      {tag: 'button', id: 'back-btn', text: 'Back to Home', click: showHome}
    ];

    elements.forEach(element => {
      let el = gen(element.tag);
      el.textContent = element.text;
      el.src = element.src;
      el.alt = element.alt;
      el.id = element.id;
      el.classList.add(element.class);
      el.addEventListener('click', element.click);
      parent.appendChild(el);
    });
  }

  /**
   * toggle the confirm button, called when click on buy now button
   */
  function toggleUpConfirm() {
    id('confirm-btn').classList.remove('hidden');
    id('input-amount').classList.remove('hidden');
  }

  /**
   * login function, use cookie to store the login status,
   * goes back to home page after 1 second
   * TODO: error handling, check if the username and password is correct
   * TODO: add some information to tell if the login is successful
   */
  async function login() {
    let username = id('username').value;
    let password = id('password').value;
    let reqForm = new FormData();
    reqForm.append('username', username);
    reqForm.append('password', password);
    try {
      let res = await fetch('/login', {method: 'POST', body: reqForm});
      res = await statusCheck(res);
      let user = await res.json();
      let uid = user.uid;
      document.cookie = "login=true; expires=Thu, 18 Dec 2023 12:00:00 UTC";
      document.cookie = "uid=" + uid + "; expires=Thu, 18 Dec 2023 12:00:00 UTC";
      showHome();
      id('username').value = '';
      id('password').value = '';
      id('login-btn').classList.add('hidden');
      id('logoff-btn').classList.remove('hidden');
      id('cart-btn').classList.remove('hidden');
      id('transaction-btn').classList.remove('hidden');
      showMessage('Logged in successfully!');
    } catch (err) {
      showMessage('Invalid username or password.');
    }
  }

  /**
   * logoff function, clear the cookie and toggle the buttons
   * TODO: add some information to tell if the logoff is successful
   */
  function logoff() {
    document.cookie = "login=false; expires=Thu, 18 Dec 2013 12:00:00 UTC";
    document.cookie = "uid=; expires=Thu, 18 Dec 2013 12:00:00 UTC";
    id('login-btn').classList.remove('hidden');
    id('logoff-btn').classList.add('hidden');
    id('cart-btn').classList.add('hidden');
    id('transaction-btn').classList.add('hidden');
    id('signup-btn').classList.remove('hidden');
    showHome();
    showMessage('Log Off Successfully!');
  }

  /**
   * check the login status and toggle the buttons, called when the page is loaded
   */
  function loginCheck() {
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      let pair = cookie.split('=');
      if (pair[0] === 'login' && pair[1] === 'true') {
        id('login-btn').classList.add('hidden');
        id('logoff-btn').classList.remove('hidden');
        id('cart-btn').classList.remove('hidden');
        id('transaction-btn').classList.remove('hidden');
        id('signup-btn').classList.add('hidden');
      }
    }
  }

  /**
   * make a purchase for one item, get uid from cookie, amount is 1
   * used by the buy button in the detail page
   * TODO: error handling, check if the user is logged in
   * TODO: add some information to tell if the purchase is successful
   * and show the confirmation number if it is successful
   * @param {string} iid - the id of the item
   */
  async function purchaseOne(iid, amount) {
    let uid = verifyLogin();
    if (uid === undefined) {
      showMessage('Please login first');
    } else {
      let reqForm = new FormData();
      reqForm.append('uid', uid);
      reqForm.append('iid', iid);
      reqForm.append('amount', amount);
      try {
        let res = await fetch('/purchase', {method: 'POST', body: reqForm});
        res = await statusCheck(res);
        let transaction = await res.json();
        showMessage("Purchase Completed! Your Confirmation Number is: " + transaction.ccode);
      } catch (err) {
        showMessage(err);
      }
    }
  }

  /**
   * search function, get the search parameters from several input
   * and send request to the api, use the response to show the result
   * on home page, same logic as showAllItems
   */
  async function search() {
    let request = buildRequest();
    try {
      let res = await fetch(request);
      res = await statusCheck(res);
      let items = await res.json();
      toggleOnHome();
      id('home').innerHTML = '';
      for (let item of items) {
        let card = itemCard(item);
        card.querySelector('img').addEventListener('click', showCardDetail);
        card.querySelector('h1').addEventListener('click', showCardDetail);
        id('home').appendChild(card);
      }
    } catch (err) {
      showMessage(err);
    }
  }

  /**
   * search function, get the search parameters from several input
   * and send request to the api
   * @returns {Dom} the request of the search
   */
  function buildRequest() {
    let request = '/search';
    if (id('lower').value === '') {
      id('lower').value = '0';
    }
    if (id('upper').value === '') {
      id('upper').value = '100000';
    }
    request += '?priceRange=' + id('lower').value + '-' + id('upper').value;
    if (id('search-term').value !== '') {
      request += '&name=' + id('search-term').value.trim();
    }
    request += '&category=' + id('catg').value;
    if (id('no-stock').checked) {
      request += '&noStock=true';
    }
    return request;
  }

  /**
   * show all transactions for the current user in the transaction page
   * TODO: error handling, check if the user is logged in, and show appropriate
   * information if there is no transaction for the user
   */
  async function showAllTransactions() {
    let uid = verifyLogin();
    if (uid === undefined) {
      showMessage('Please login first');
    } else {
      try {
        let res = await fetch('/transactions/' + uid);
        res = await statusCheck(res);
        let transactions = await res.json();
        let parent = id('transaction');
        parent.innerHTML = '';
        for (let transaction of transactions) {
          let card = transactionCard(transaction);
          parent.appendChild(card);
        }
      } catch (err) {
        showMessage(err);
      }
    }
  }

  /**
   * generate a card for a transaction, used by showAllTransactions
   * @param {Object} transaction - the transaction object that contains all the information
   * @returns {HTMLElement} the card for the transaction
   */
  function transactionCard(transaction) {
    let card = gen('div');
    card.classList.add('t-card');
    let ccode = gen('p');
    ccode.textContent = 'Confirmation Number: ' + transaction.ccode;
    card.appendChild(ccode);
    let tid = gen('p');
    tid.textContent = 'Item ID: ' + transaction.iid;
    card.appendChild(tid);
    let amount = gen('p');
    amount.textContent = 'Amount: ' + transaction.amount;
    card.appendChild(amount);
    let img = gen('img');
    img.src = 'img/item/' + transaction.img;
    img.alt = transaction.name;
    card.appendChild(img);
    let name = gen('h1');
    name.textContent = transaction.name;
    card.appendChild(name);
    let price = gen('p');
    price.textContent = '$' + transaction.price;
    price.classList.add('price');
    card.appendChild(price);
    return card;
  }

  /**
   * verify the login status, return the uid if logged in
   * @returns {string} the uid of the user, undefined if not logged in
   */
  function verifyLogin() {
    // Users must be logged in to make the purchase
    let cookies = document.cookie.split(';');
    let uid;
    for (let cookie of cookies) {
      let pair = cookie.split('=');
      if (pair[0].trim() === 'uid') {
        uid = pair[1];
      }
    }
    return uid;
  }

  /**
   * add an item to the cart
   * TODO: error handling, check if the user is logged in
   * TODO: add some information to tell if the item is added successfully
   * @param {string} iid - the id of the item
   */
  async function addToCart(iid) {
    let uid = verifyLogin();
    if (uid === undefined) {
      showMessage('Please login first');
    } else {
      let reqForm = new FormData();
      reqForm.append('uid', uid);
      reqForm.append('iid', iid);
      try {
        let res = await fetch('/addcart', {method: 'POST', body: reqForm});
        res = await statusCheck(res);
        let cart = await res.text();
        showMessage(cart);
      } catch (err) {
        showMessage(err);
      }
    }
  }

  /**
   * show all items in the cart
   * currently only show the item id and amount
   * TODO: show the item detail
   */
  async function showCartItems() {
    showCart();
    let uid = verifyLogin();
    if (uid === undefined) {
      showMessage('Please login first');
    } else {
      try {
        let res = await fetch('/showcart/' + uid);
        res = await statusCheck(res);
        let items = await res.json();
        let parent = id('cart');
        parent.innerHTML = '';
        for (let item of items) {
          let card = cartItemCard(item);
          parent.appendChild(card);
        }
        let purchaseAll = gen('button');
        purchaseAll.textContent = 'Purchase All';
        purchaseAll.addEventListener('click', () => {
          purchaseAllItems(uid);
        });
        parent.appendChild(purchaseAll);
      } catch (err) {
        showMessage(err);
      }
    }
  }

  /**
   * generate a card for an item in the cart, used by showCartItems
   * @param {Object} item - the item object that contains the item id and amount
   * @returns {HTMLElement} the card for the item
   */
  function cartItemCard(item) {
    let card = gen('div');
    card.classList.add('c-card');
    let img = gen('img');
    img.src = 'img/item/' + item.img;
    img.alt = item.name;
    card.appendChild(img);
    let content = gen('div');
    content.classList.add('c-card-content');
    let name = gen('h1');
    name.textContent = item.name;
    content.appendChild(name);
    let price = gen('p');
    price.textContent = '$' + item.price;
    price.classList.add('price');
    content.appendChild(price);
    let amount = gen('span');
    amount.textContent = 'Amount: ' + item.amount;
    content.appendChild(amount);
    card.appendChild(content);
    return card;
  }

  /**
   * send request to purchase all items in the cart
   * connect to the bulk/:uid endpoint
   * @param {string} uid - the id of the user
   */
  async function purchaseAllItems(uid) {
    try {
      let res = await fetch('/bulk/' + uid);
      res = await statusCheck(res);
      let bulkRes = await res.json();
      let text = 'Purchase Completed! Your Confirmation Number is: ' + bulkRes.ccode;
      showMessage('Purchase Completed!');
      showMessage(text);
      let parent = id('cart');
      parent.innerHTML = '';
      showCartItems();
    } catch (err) {
      showMessage(err);
    }
  }

  /**
   * sign up a new user with username, password and email
   * immediately goes to login page after sign up
   * TODO: error handling, check if the username is already taken
   * TODO: set timeout for the sign up, show success or fail for 1 second
   */
  async function signUp() {
    let username = id('username').value;
    let password = id('password').value;
    let email = id('email').value;
    let reqForm = new FormData();
    reqForm.append('username', username);
    reqForm.append('password', password);
    reqForm.append('email', email);
    try {
      let res = await fetch('/register', {method: 'POST', body: reqForm});
      res = await statusCheck(res);
      let user = await res.json();
      if (user.success === true) {
        showLogin();
        id('username').value = '';
        id('password').value = '';
        showMessage('Logged in successfully!');
      } else {
        showMessage('Invalid username or password.');
      }
    } catch (err) {
      showMessage(err);
    }
  }

  /**
   * check the status of the response helper function
   * @param {Object} res - the response from the api
   * @returns {Object} the response from the api
   */
  async function statusCheck(res) {
    if (!res.ok) { // status is not in the ok range, we reject the promise
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * show all message need like add to cart login or error messages.
   * @param {Object} message - the response from the api
   */
  function showMessage(message) {
    let parent = id('messager');
    parent.innerHTML = '';
    let text = gen('p');
    text.textContent = message;
    parent.appendChild(text);
    id('messager').classList.remove('hidden');
    setTimeout(function() {
      id('messager').classList.add('hidden');
    }, twosec);
  }

  /** show the oprion search view */
  function showOptions() {
    id('option-window').classList.toggle('hidden');
  }

  /** toggle the view of the list and grid */
  function togglelayout() {
    id('home').classList.toggle('list-layout');
    id('home').classList.toggle('grid-layout');
  }

  /** only show home page */
  function showHome() {
    showAllItems();
    toggleOnHome();
  }

  /** toggle the home view */
  function toggleOnHome() {
    id('home-out').classList.remove('hidden');
    id('detail').classList.add('hidden');
    id('login').classList.add('hidden');
    id('cart').classList.add('hidden');
    id('transaction').classList.add('hidden');
  }

  /** show the camera and lens view */
  function showcamlen() {
    id('home-out').classList.remove('hidden');
    id('detail').classList.add('hidden');
    id('login').classList.add('hidden');
    id('cart').classList.add('hidden');
    id('transaction').classList.add('hidden');
  }

  /** only show detail page */
  function showDetail() {
    id('home-out').classList.add('hidden');
    id('detail').classList.remove('hidden');
    id('login').classList.add('hidden');
    id('cart').classList.add('hidden');
    id('transaction').classList.add('hidden');
  }

  /** only show login page */
  function showLogin() {
    id('home-out').classList.add('hidden');
    id('detail').classList.add('hidden');
    id('login').classList.remove('hidden');
    id('sing-spec').classList.add('hidden');
    id('cart').classList.add('hidden');
    id('transaction').classList.add('hidden');
    id('login-submit').classList.remove('hidden');
    id('signup-submit').classList.add('hidden');
    id('login-submit').addEventListener('click', login);
  }

  /** show login page and show the email input */
  function showSignUp() {
    id('home-out').classList.add('hidden');
    id('detail').classList.add('hidden');
    id('login').classList.remove('hidden');
    id('sing-spec').classList.remove('hidden');
    id('cart').classList.add('hidden');
    id('transaction').classList.add('hidden');
    id('login-submit').classList.add('hidden');
    id('signup-submit').classList.remove('hidden');
    id('signup-submit').addEventListener('click', signUp);
  }

  /** only show cart page */
  function showCart() {
    id('home-out').classList.add('hidden');
    id('detail').classList.add('hidden');
    id('login').classList.add('hidden');
    id('cart').classList.remove('hidden');
    id('transaction').classList.add('hidden');
  }

  /** only show transaction page */
  function showTransaction() {
    id('home-out').classList.add('hidden');
    id('detail').classList.add('hidden');
    id('login').classList.add('hidden');
    id('cart').classList.add('hidden');
    id('transaction').classList.remove('hidden');
  }

  /**
   * generate a tag
   * @param {string} tagName - The name of the tag for the new element.
   * @returns {HTMLElement} The newly created HTML element.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * get element by id helper function
   * @param {string} id - the id of the element
   * @returns {HTMLElement} the element with the id
   */
  function id(id) {
    return document.getElementById(id);
  }

})();