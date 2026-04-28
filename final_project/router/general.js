const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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

public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/internal_books");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(200).json(books);
  }
});

public_users.get('/internal_books', (req, res) => {
    res.status(200).json(books);
});

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/internal_books`);
    const book = response.data[isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book via Axios" });
  }
});
  
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get("http://localhost:5000/internal_books");
    const allBooks = Object.values(response.data);
    const filteredBooks = allBooks.filter(b => b.author.toLowerCase() === author.toLowerCase());
    
    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Author not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching by author via Axios" });
  }
});

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  try {
    const response = await axios.get("http://localhost:5000/internal_books");
    const allBooks = Object.values(response.data);
    const filteredBooks = allBooks.filter(b => b.title.toLowerCase() === title);
    
    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Title not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching by title via Axios" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      return res.status(200).json(book.reviews);
    } else {
      return res.status(200).json({ message: "No reviews found for this book." });
    }
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;