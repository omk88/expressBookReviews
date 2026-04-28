const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  const validUser = users.find((user) => user.username === username && user.password === password);

  if (validUser) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let review = req.query.review; 
  let username = req.session.authorization['username']; 

  if (books[isbn]) {
      let book = books[isbn];
      book.reviews[username] = review;
      return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (books[isbn]) {
    let book = books[isbn];
    
    if (book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
    } else {
      return res.status(404).json({ message: "No review found for this user on this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
