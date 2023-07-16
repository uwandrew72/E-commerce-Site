DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Transactions;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Carts;

CREATE TABLE Items (
  iid INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255),
  img VARCHAR(255),
  spec VARCHAR(255),
  info VARCHAR(255),
  price INTEGER,
  stock INTEGER,
  category VARCHAR(255)
);

CREATE TABLE Transactions (
  tid INTEGER PRIMARY KEY AUTOINCREMENT,
  iid INTEGER REFERENCES Items(iid),
  amount INTEGER,
  uid INTEGER REFERENCES Users(uid),
  ccode INTEGER
);

CREATE TABLE Carts (
  iid INTEGER REFERENCES Items(iid),
  amount INTEGER,
  uid INTEGER REFERENCES Users(uid),
  PRIMARY KEY (iid, uid)
);

CREATE TABLE Users (
  uid INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(255),
  password VARCHAR(255),
  email VARCHAR(255)
);

INSERT INTO Items (name, img, spec, info, price, stock, category)
VALUES ('sony a7', 'sony_a7.jpg', '24.3MP', 'Full Frame', 1000, 10, 'camera');
INSERT INTO Items (name, img, spec, info, price, stock, category)
VALUES ('leica q3', 'leica_q3.jpg', '47.3MP', 'Full Frame', 2000, 10, 'camera');
INSERT INTO Items (name, img, spec, info, price, stock, category)
VALUES ('zeiss24-70', 'zeiss24-70.jpg', 'f4', 'optical', 500, 20, 'len');
INSERT INTO Items (name, img, spec, info, price, stock, category)
VALUES ('canon24-70', 'canon24-70.jpg', 'f2.8', 'optical', 1000, 20, 'len');
INSERT INTO Users (username, password, email)
VALUES ('admin', 'admin', 'admin@gmail.com');
INSERT INTO Users (username, password, email)
VALUES ('user', 'user', 'user@gmail.com');
INSERT INTO Carts (iid, amount, uid)
VALUES (1, 1, 2);
INSERT INTO Carts (iid, amount, uid)
VALUES (2, 1, 2);