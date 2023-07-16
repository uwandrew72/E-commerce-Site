# Digital Camera E-commerce Site API Documentation
The Digital Camera E-Commerce API provides various endpoints to support the features of a digital camera e-commerce website. Below is the documentation for each endpoint corresponding to the mentioned requirements.

## Retrieve All Items
**Request Format:** /items/:class

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Retrieves a list of all items available in the digital camera e-commerce store. Users can browse through all available items. Users can switch between different layouts such as list view and grid view.
We have two class that including "camera" and "len".

**Example Request:** /items/camera

**Example Response:**
```
{
  {
    "iid": 22361,
    "name": "Fujifilm X70",
    "img": "fujifilm_x70.jpg",
    "price": "2999"
  }
  ...
}
```

/items/len

```
{
  {
    "iid": 223361,
    "name": "Fujifilm X35 WR",
    "img": "fujifilm_x35_wr.jpg",
    "price": "999"
  }
  ...
}
```
**Error Handling:**
- Possible 404 (no result found) errors:
  - If there is no match item, an error is returned with the message: `No items found!`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`

## User Login
**Request Format:** /login

**Request Type:** POST

**Request Body**: username, password

**Returned Data Format**: JSON

**Description:** Validates user credentials and logs in the user. Users can enter their username and password to log in. Users can choose to save their username for future login attempts.

**Example Request:** /login
```
body: {
  "username": "John",
  "password": "secretpassword"
}
```

**Example Response:**
```
{
  "uid": 123,
  "username": "John",
  "success": true
}
```

**Error Handling:**
- Possible 400 (invalid user) errors:
  - If passed in an invalid user name or invalid password, returns an error with the message: `Wrong user name or password!`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`

## Retrieve Item Details
**Request Format:** /detail/:iid

**Request Type**: GET

**Returned Data Format**: JSON

**Description:** Retrieves detailed information about a specific item. Users can click on an individual item to view more details. Detailed view shows name, image, description, and other information of the item.

**Example Request:** /detail/223361

**Example Response:**
```
  {
    "iid": 223361,
    "name": "Fujifilm X35 WR",
    "img": "fujifilm_x35_WR.jpg",
    "spec": "Prime lens | Fujifilm G",
    "info": "The XF 8mm F3.5 R WR is an compact ultra-wide prime for Fujifilm's X-system mirrorless cameras, and offers a 12mm equivalent angle of view. It's the widest X-mount prime lens available. While remaining a rather compact and lightweight lens, Fujifilm managed to fit in a locking aperture ring and weather-sealing, making it great for enthusiasts and beginners alike."
    "price": "999",
    "stock": 99
  }
```

**Error Handling:**
- Possible 404 errors:
  - If the item does not exist, an error is returned with the message: `Item not found!`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`

## Purchase Item
**Request Format:** /purchase

**Request Type**: POST

**Request Body**: user_id, item_id, item_amount

**Returned Data Format**: JSON

**Description:** Processes a user's purchase transaction for an item. Users must be logged in to perform a transaction. Users can confirm and submit their transaction.

**Example Request:** /purchase
```
body: {
  "uid": 123,
  "iid": 1,
  "amount": 1
}
```

**Example Response:**
```
{
  "tid": 456,
  "iid": 12312,
  "amount": 1,
  "name": "Canon EOS Rebel T7",
  "ccode": "ABCD1234",
}
```

**Error Handling:**
- Possible 400 (invalid request) errors:
  - If purchasing an out of stock item, an error is returned with the message: `{id} is currently out of stock, please register email nodification and we will notify you when restock!`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`


## Search and Filter Items
**Request Format:** /search

**Request Type**: GET

**Returned Data Format**: JSON

**Description:** Users can enter keywords to search for items. Users can search using various item attributes. Searches and filters items based on user-provided criteria. Takes multiple query parameters (brand, category, price_range) to make the result percise.
four parameters:
1. name = fuji
2. priceRange = 500-2000
3. category = len
4. noStock = true

**Example Request:** /search?name=fuji&priceRange=500-2000&category=len&noStock=true

**Example Response:**
```
{
  {
    "iid": 22361,
    "name": "Fujifilm X70",
    "img": "fujifilm_x70.jpg",
    "price": "699"
  },
  {
    "iid": 223361,
    "name": "Fujifilm X35 WR",
    "img": "fujifilm_x35_wr.jpg",
    "price": "999"
  },
  ...
}
```

**Error Handling:**
- Possible 404 (no result found) errors:
  - If there is no match item, an error is returned with the message: `There is no match item, please change your fliter and try again!`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`

## Retrieve Transaction History
**Request Format:** /transactions/:uid

**Request Type**: GET

**Returned Data Format**: JSON

**Description:** Users must be logged in to view transaction history. Retrieves the transaction history for a logged-in user. Users can view details of their previous transactions, including item names and confirmation numbers.

**Example Request:** /transactions/123

**Example Response:**
```
{
  {
    "tid": 1,
    "iid": 2,
    "name": "Nikon D3500",
    "img": "nicon1"
    "ccode": "EFGH5678"
  },
  {
    "tid": 2,
    "iid": 4,
    "name": "Sony Alpha a6000",
    "img": "nicon1"
    "ccode": "IJKL9012"
  },
  ...
}
```

**Error Handling:**
- Possible 404 (invalid request) errors:
  - If you are trying to access the transaction of a user that not currently logged in, an error is returned with the message: `Access denied, please login first!`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`


## Bulk Purchase
**Request Format:** /addcart

**Request Type**: POST

**Request Body**:  user_id, item_id

**Returned Data Format**: JSON

**Description:**

**Example Request:** /addcart
POST parameters: user_id=123&item_id=33442

**Example Response:**
```
"success"
```

## show cart
**Request Format:** /showcart/:userid

**Request Type**: GET

**Returned Data Format**: JSON

**Description:**:

**Example Request:** /showcart/132

**Example Response:**
```
{
  {
    iid: 456
    amount: 3
    uid: 132
  },
  {
    iid: 431
    amount: 2
    uid: 132
  }
  ...
}
```

## Bulk Purchase
**Request Format:** /bulk/:uid

**Request Type**: GET

**Returned Data Format**: JSON

**Description:** Allows users to buy multiple items at once. Users can add multiple items to a cart. The cart retains its contents even after refreshing the page. Users can proceed to purchase all items in the cart together.

**Example Request:** /bulk/354

**Example Response:**
```
{
  "success": true
  "ccode": 3334
}
```

**Error Handling:**
- Possible 404 (invalid request) errors:
  - If one of the items is  out of stock, an error is returned with the message: `One or more items are out of stock! Please check and try again.`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`

## Create a New User
**Request Format:** /register

**Request Type**: POST

**Request Body**: username, password

**Returned Data Format**: JSON

**Description:** Allows users to create a new account. Users can create an account by providing a username, password, and email. Implement hashing or other security methods to enhance user account security.

**Example Request:** /register
```
body: {
  "username": "John",
  "password": "secretpassword"
}
```

**Example Response:**
```
{
  "success": true,
  "uid": 364
}
```

**Error Handling:**
- Possible 404 (invalid request) errors:
  - If the user is already registered, an error is returned with the message: `User already registered, please login.`
- Possible 500 errors:
  - If something else goes wrong on the server, returns an error with the message: `Something went wrong. Please try again later.`