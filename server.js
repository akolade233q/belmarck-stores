const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB_FILE = path.join(__dirname, 'database.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize database files if they don't exist
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialProducts = [
      { id: "1", name: "Mini Lunchbag", price: 25000, img: "Mini Lunchbag.jpg", stock: 5 },
      { id: "2", name: "Phone holder", price: 120000, img: "Phone holder.jpg", stock: 2 },
      { id: "3", name: "Fire stop", price: 180000, img: "Fire stop.jpg", stock: 0 },
      { id: "4", name: "Scientific Calculator", price: 180000, img: "Scientific Calculator.jpg", stock: 10 },
      { id: "6", name: "Clipper", price: 180000, img: "k.png", stock: 1 },
      { id: "7", name: "Large lunchbag", price: 180000, img: "Large lunchbag.jpg", stock: 4 }
    ];
    fs.writeFileSync(DB_FILE, JSON.stringify(initialProducts, null, 2));
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
}
initDatabase();

// Get real-time products
app.get('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  res.json(products);
});

// NEW: Customer Sign Up / Registration Endpoint
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

  // Prevent duplicate usernames
  const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (userExists) {
    return res.status(400).json({ success: false, message: "Username is already taken!" });
  }

  // Save new user profile credentials into database
  users.push({ username, password });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ success: true, message: "Registration successful! You can now log in." });
});

// UPGRADED: Dynamic Customer Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));

  // Validate credentials against our stored users database
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid username or password!" });
  }
});

// Secure Checkout validation system
app.post('/api/checkout', (req, res) => {
  const { cart } = req.body;
  let products = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  
  for (const itemName in cart) {
    const product = products.find(p => p.name === itemName);
    if (!product || product.stock < cart[itemName].qty) {
      return res.status(400).json({ success: false, message: "Inventory transaction error." });
    }
  }

  for (const itemName in cart) {
    const product = products.find(p => p.name === itemName);
    product.stock -= cart[itemName].qty;
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running perfectly at http://localhost:3000`);
});
