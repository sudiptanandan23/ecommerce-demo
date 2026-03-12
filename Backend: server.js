const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const GITHUB_CLIENT_ID = 'YOUR_CLIENT_ID';
const GITHUB_CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

const db = new sqlite3.Database('./db.sqlite');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    githubId TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    items TEXT,
    total REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Seed products if empty
  db.all('SELECT * FROM products', (err, rows) => {
    if (rows.length === 0) {
      db.run('INSERT INTO products (name, price) VALUES (?, ?)', ['Product 1', 10]);
      db.run('INSERT INTO products (name, price) VALUES (?, ?)', ['Product 2', 20]);
      db.run('INSERT INTO products (name, price) VALUES (?, ?)', ['Product 3', 30]);
    }
  });
});

// Passport serialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => done(err, user));
});

// Local strategy
passport.use(new LocalStrategy((username, password, done) => {
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (!user) return done(null, false);
    bcrypt.compare(password, user.password, (err, res) => {
      if (res) return done(null, user);
      else return done(null, false);
    });
  });
}));

// GitHub strategy
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    db.get('SELECT * FROM users WHERE githubId = ?', [profile.id], (err, user) => {
      if (user) return done(null, user);
      // Create new user
      db.run('INSERT INTO users (username, githubId) VALUES (?, ?)', [profile.username, profile.id], function(err) {
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => done(null, user));
      });
    });
  }
));

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
      if (err) return res.redirect('/register.html?error=1');
      res.redirect('/login.html');
    });
  });
});

// Local login
app.post('/login', passport.authenticate('local', {
  successRedirect: '/products.html',
  failureRedirect: '/login.html?error=1'
}));

// GitHub login
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => res.redirect('/products.html')
);

app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

// API: Get user info
app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// API: Get products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => res.json(rows));
});

// API: Cart (session)
app.post('/api/cart', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not logged in' });
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(req.body);
  res.json({ cart: req.session.cart });
});
app.get('/api/cart', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not logged in' });
  res.json({ cart: req.session.cart || [] });
});

// API: Checkout
app.post('/api/checkout', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not logged in' });
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.status(400).json({ error: 'Cart empty' });
  // Calculate total
  db.all('SELECT * FROM products', (err, products) => {
    let total = 0;
    cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod) total += prod.price;
    });
    db.run('INSERT INTO orders (userId, items, total) VALUES (?, ?, ?)', [req.user.id, JSON.stringify(cart), total], function(err) {
      req.session.cart = [];
      res.json({ success: true, orderId: this.lastID });
    });
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
