const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});



// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const get_books = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("Could not retrieve books");
      }
    });

    const bookList = await get_books;

    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list" });
  }
});

// Get book details based on ISBN using Async-Await/Promises
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        const fetchBookByISBN = new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject("Book with this ISBN not found");
            }
        });

        const bookDetails = await fetchBookByISBN;
        return res.status(200).json(bookDetails);

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
  
// Get book details based on Author using Async-Await/Promises
public_users.get('/author/:author', async function (req, res) {
  const authorName = req.params.author;

  try {
    const fetchByAuthor = new Promise((resolve, reject) => {
      const isbns = Object.keys(books);
      const filtered_books = [];

      isbns.forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === authorName.toLowerCase()) {
          filtered_books.push({ isbn: isbn, ...books[isbn] });
        }
      });

      if (filtered_books.length > 0) {
        resolve(filtered_books);
      } else {
        reject("No books found by this author");
      }
    });

    const result = await fetchByAuthor;
    return res.status(200).json(result);

  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get book details based on Title using Async-Await/Promises
public_users.get('/title/:title', async function (req, res) {
  const requestedTitle = req.params.title.toLowerCase();

  try {
    const fetchByTitle = new Promise((resolve, reject) => {
      const isbns = Object.keys(books);
      const filtered_books = [];

      isbns.forEach((isbn) => {
        if (books[isbn].title.toLowerCase() === requestedTitle) {
          filtered_books.push({ isbn: isbn, ...books[isbn] });
        }
      });

      if (filtered_books.length > 0) {
        resolve(filtered_books);
      } else {
        reject("No books found with this title");
      }
    });

    const result = await fetchByTitle;
    return res.status(200).json(result);

  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
