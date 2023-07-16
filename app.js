/**
 * This is the js file to implement the server side.
 * It contains the following endpoints:
 * 1. GET /items/:class - get all items in a category, or all items
 * 2. POST /login - user login endpoint
 * 3. GET /detail/:iid - get detail of an item
 * 4. GET /search - search items by name, priceRange, category, and noStock
 * 5. POST /purchase - make a purchase
 * 6. GET /transactions/:uid - show all transactions of a user
 * 7. POST /addcart - add an item to the user's cart
 * 8. GET /showcart/:uid - get all items in the user's cart
 * 9. GET /bulk/:uid - bulk purchase
 * 10. POST /register - user registration
 */
'use strict';
const express = require('express');
const app = express();
const multer = require('multer');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const OK_STATUS = 200;
const BAD_REQUEST = 400;
const SERVER_ERROR = 500;
const DEFAULT_PORT = 8000;
const OFFSET = -5; // offset for search

// a list of iid that has infinite capacity
const IF_ID1 = 10379;
const IF_ID2 = 11512;
const INFINITE_CAPACITY = [IF_ID1, IF_ID2];

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

/**
 * get all items in a category, or all items
 */
app.get('/items/:class', async (req, res) => {
  let category = req.params.class;
  if (category) {
    let db = await getDBConnection();

    // check if the category is all
    if (category === 'all') {
      let query = 'SELECT iid, name, img, spec, price FROM Items';
      let result = await db.all(query);
      res.status(OK_STATUS).json(result);
    } else {
      try {
        let query = 'SELECT iid, name, img, spec, price FROM Items WHERE category = ?';
        let result = await db.all(query, [category]);
        res.status(OK_STATUS).json(result);
      } catch (err) {
        res.type('text');
        res.status(SERVER_ERROR).send('Error: ' + err);
      }
    }
    await db.close();
  } else {
    res.type('text');
    res.status(BAD_REQUEST).send('Missing category.');
  }
});

// user login endpoint
app.post('/login', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (username && password) {
    try {
      let db = await getDBConnection();
      let query = 'SELECT * FROM Users WHERE username = ? AND password = ?';
      let result = await db.get(query, [username, password]);
      await db.close();
      let resMessage = {};
      if (result) {
        resMessage.username = result.username;
        resMessage.uid = result.uid;
        resMessage.success = true;
        res.status(OK_STATUS).json(resMessage);
      } else {
        res.type('text');
        res.status(BAD_REQUEST).send('No user found or wrong password.');
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send('Error: ' + err);
    }
  } else {
    res.type('text');
    res.status(BAD_REQUEST).send('Missing username or password.');
  }
});

// tested, get detail of an item
app.get('/detail/:iid', async (req, res) => {
  let iid = req.params.iid;
  if (iid) {
    try {
      let db = await getDBConnection();
      let query = 'SELECT * FROM Items WHERE iid = ?';
      let result = await db.get(query, [iid]);
      await db.close();
      if (result) {
        res.status(OK_STATUS).json(result);
      } else {
        res.type('text');
        res.status(BAD_REQUEST).send('No item found.');
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send('Error: ' + err);
    }
  } else {
    res.type('text');
    res.status(BAD_REQUEST).send('Missing iid.');
  }
});

// search items by name, priceRange, category, and noStock
app.get('/search', async (req, res) => {
  let name = req.query.name;
  let priceRange = req.query.priceRange;
  let category = req.query.category;
  let noStock = req.query.noStock;
  let [query, params] = getQuery(name, priceRange, category, noStock);
  try {
    let db = await getDBConnection();
    let result = await db.all(query, params);
    await db.close();
    if (result.length !== 0) {
      res.status(OK_STATUS).json(result);
    } else {
      res.type('text').status(BAD_REQUEST);
      res.send('No items found.');
    }
  } catch (err) {
    res.type('text').status(SERVER_ERROR);
    res.send('Error: ' + err);
  }
});

/**
 * get the query string for search
 * @param {String} name - the name of the item
 * @param {String} priceRange - the price range of the item
 * @param {String} category - the category of the item
 * @param {String} noStock - whether to show items with no stock
 * @returns {Array} - the query string and the params
 */
function getQuery(name, priceRange, category, noStock) {
  let query = 'SELECT iid, name, img, spec, price FROM Items WHERE ';
  let params = [];
  if (name) {
    query += 'name LIKE ? AND ';
    params.push('%' + name + '%');
  }
  if (priceRange) {
    let range = priceRange.split('-');
    query += 'price BETWEEN ? AND ? AND ';
    params.push(range[0]);
    params.push(range[1]);
  }
  if (category !== 'all') {
    query += 'category = ? AND ';
    params.push(category);
  }
  if (!noStock) {
    query += 'stock > 0 AND ';
  }
  query = query.slice(0, OFFSET);
  return [query, params];
}

// function tested, make a purchase
app.post('/purchase', async (req, res) => {
  let [uid, iid, amount, log] = [req.body.uid, req.body.iid, req.body.amount, req.cookies.login];
  if (log && uid && iid && amount) {
    try {
      let db = await getDBConnection();

      // get current ccode
      let query = 'SELECT ccode FROM Transactions WHERE uid = ? ORDER BY ccode DESC LIMIT 1';
      let ccode = await db.get(query, [uid]);
      let newccode = 0;
      if (ccode) {
        newccode = ccode.ccode + 1;
      }

      // process the purchase
      let pur = await processOnePurchase(db, uid, iid, amount, newccode);
      if (pur) {
        query = 'SELECT * FROM Transactions WHERE tid = ?';
        let result = await db.get(query, [pur]);
        res.status(OK_STATUS).json(result);
      } else {
        res.type('text');
        res.status(BAD_REQUEST).send('Not enough items in stock.');
      }
      await db.close();
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send('Error: ' + err);
    }
  } else {
    res.type('text');
    res.status(BAD_REQUEST).send('Missing uid, iid, or amount.');
  }
});

// show all transactions of a user
app.get('/transactions/:uid', async (req, res) => {
  let uid = req.params.uid;
  if (uid) {
    try {
      let db = await getDBConnection();
      let query = 'SELECT * FROM Transactions, Items \
        WHERE Transactions.iid = Items.iid AND uid = ?';
      let result = await db.all(query, [uid]);
      await db.close();
      if (result.length !== 0) {
        res.status(OK_STATUS).json(result);
      } else {
        res.type('text').status(BAD_REQUEST);
        res.send('No transactions found.');
      }
    } catch (err) {
      res.type('text').status(SERVER_ERROR);
      res.send('Error: ' + err);
    }
  } else {
    res.type('text').status(BAD_REQUEST);
    res.send('Missing uid.');
  }
});

// add an item to the user's cart
app.post('/addcart', async (req, res) => {
  let uid = req.body.uid;
  let iid = req.body.iid;
  if (uid && iid) {
    try {
      let db = await getDBConnection();

      // check if the item is already in the cart
      let query = 'SELECT * FROM Carts WHERE uid = ? AND iid = ?';
      let result = await db.get(query, [uid, iid]);
      if (result) {

        // if it is, update the amount
        let update = 'UPDATE Carts SET amount = ? WHERE uid = ? AND iid = ?';
        await db.run(update, [result.amount + 1, uid, iid]);
      } else {

        // if not, add it to the cart
        let insert = 'INSERT INTO Carts (uid, iid, amount) VALUES (?, ?, ?)';
        await db.run(insert, [uid, iid, 1]);
      }
      await db.close();
      res.type('text').status(OK_STATUS)
        .send('Item added to cart.');
    } catch (err) {
      res.type('text').status(SERVER_ERROR)
        .send('Error: ' + err);
    }
  } else {
    res.type('text').status(BAD_REQUEST)
      .send('Missing uid or iid.');
  }
});

// get all items in the user's cart
app.get('/showcart/:uid', async (req, res) => {
  let uid = req.params.uid;
  if (uid) {
    try {
      let db = await getDBConnection();
      let query = 'SELECT * FROM Carts, Items WHERE Carts.iid = Items.iid AND uid = ?';
      let result = await db.all(query, [uid]);
      await db.close();
      if (result.length !== 0) {
        res.status(OK_STATUS).json(result);
      } else {
        res.type('text');
        res.status(OK_STATUS).json(result);
      }
    } catch (err) {
      res.type('text');
      res.status(SERVER_ERROR).send('Error: ' + err);
    }
  } else {
    res.type('text');
    res.status(BAD_REQUEST).send('Missing uid.');
  }
});

// bulk purchase
app.get('/bulk/:uid', async (req, res) => {
  let uid = req.params.uid;
  if (uid) {
    let db = await getDBConnection();
    let query = 'SELECT * FROM Carts WHERE uid = ?';
    let result = await db.all(query, [uid]);
    if (result.length !== 0) {
      let [enough, noStock] = await enoughCheck(db, result);
      if (enough) {
        let newccode = await generateCCode(db);

        // process the purchase
        for (let i = 0; i < result.length; i++) {
          processOnePurchase(db, uid, result[i].iid, result[i].amount, newccode);
        }
        let resMessage = await deleteAllCart(db, uid, newccode);
        res.status(OK_STATUS).json(resMessage);
      } else {
        res.type('text');
        res.status(BAD_REQUEST).send('Not enough items in stock: ' + noStock.join(', '));
      }
    } else {
      res.type('text');
      res.status(BAD_REQUEST).send('No items in cart.');
    }
    await db.close();
  } else {
    res.type('text');
    res.status(BAD_REQUEST).send('Missing uid.');
  }
});

/**
 * generate a card for an item in the cart, used by showCartItems
 * @param {Object} db - the database
 * @param {Object} result - the result of the current
 * @returns {Object} return the new code
 */
async function enoughCheck(db, result) {
  // check if there are enough items in stock
  let enough = true;
  let noStock = [];
  for (let i = 0; i < result.length; i++) {
    let query = 'SELECT name, stock FROM Items WHERE iid = ?';
    let resBulk = await db.get(query, [result[i].iid]);
    if (resBulk.stock < result[i].amount && !INFINITE_CAPACITY.includes(result[i].iid)) {
      enough = false;
      noStock.push(resBulk.name);
    }
  }
  return [enough, noStock];
}

/**
 * generate a card for an item in the cart, used by showCartItems
 * @param {Object} db - the database
 * @returns {Object} return the new code
 */
async function generateCCode(db) {
  // if there are, process the purchase and generate ccode
  let query = 'SELECT DISTINCT ccode FROM Transactions ORDER BY ccode DESC LIMIT 1';
  let ccode = await db.get(query);
  let newccode = 0;
  if (ccode) {
    newccode = ccode.ccode + 1;
  }
  return newccode;
}

/**
 * generate a card for an item in the cart, used by showCartItems
 * @param {Object} db - the database
 * @param {Object} uid - user uid and name
 * @param {Object} newccode - new trans code of the item
 * @returns {HTMLElement} delete all the cart
 */
async function deleteAllCart(db, uid, newccode) {
  // delete all items in the cart
  let deleteCart = 'DELETE FROM Carts WHERE uid = ?';
  await db.run(deleteCart, [uid]);
  let resMessage = {};
  resMessage.ccode = newccode;
  resMessage.success = true;
  return resMessage;
}

// user registration
app.post('/register', async (req, res) => {
  let [username, password, email] = [req.body.username, req.body.password, req.body.email];
  if (username && password && email) {
    try {
      let db = await getDBConnection();
      let query = 'SELECT * FROM Users WHERE username = ?';
      let result = await db.get(query, [username]);
      if (result) {
        await db.close();
        res.type('text');
        res.status(BAD_REQUEST).send('Username already exists.');
      } else {
        let insert = 'INSERT INTO Users (username, password, email) VALUES (?, ?, ?)';
        let reg = await db.run(insert, [username, password, email]);
        await db.close();
        let resMessage = {};
        resMessage.success = true;
        resMessage.uid = reg.lastID;
        res.status(OK_STATUS).json(resMessage);
      }
    } catch (err) {
      res.type('text').status(SERVER_ERROR);
      res.send('Error: ' + err);
    }
  } else {
    res.type('text').status(BAD_REQUEST);
    res.send('Missing username, password or email.');
  }
});

/**
 * process one purchase of a user with the iid and amount, and return the tid
 * @param {Object} db - the database object
 * @param {String} uid - the uid of the user
 * @param {String} iid - the iid of the item
 * @param {String} amount - the amount of the item
 * @param {String} ccode - the ccode of the purchase
 * @returns {String} - the tid of the purchase or false if not enough items in stock
 */
async function processOnePurchase(db, uid, iid, amount, ccode) {

  // find if there are enough items in stock
  let query = 'SELECT stock FROM Items WHERE iid = ?';
  let res = await db.get(query, [iid]);
  if (res.stock >= amount || INFINITE_CAPACITY.includes(iid)) {

    // update the stock
    if (!INFINITE_CAPACITY.includes(iid)) {
      let update = 'UPDATE Items SET stock = ? WHERE iid = ?';
      await db.run(update, [res.stock - amount, iid]);
    }

    // add the purchase to the purchase table
    let insert = 'INSERT INTO Transactions (iid, amount, uid, ccode) VALUES (?, ?, ?, ?)';
    let lastid = await db.run(insert, [iid, amount, uid, ccode]);
    return lastid.lastID;
  }
  return false;
}

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {Object} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'test2.db',
    driver: sqlite3.Database
  });
  return db;
}

app.use(express.static('public'));
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);
