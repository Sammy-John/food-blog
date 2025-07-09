const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API route for dish data (optional for dynamic updates)
app.get('/api/meals', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'meals.json'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌍 Server is running at http://localhost:${PORT}`);
});
