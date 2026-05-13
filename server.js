const express = require('express');
const { execFile } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/add', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) return res.status(400).json({message: "All fields are required."});

  // Server-side validation
  const nameRegex = /^[a-zA-Z\s]+$/;
  const phoneRegex = /^\d{10}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!nameRegex.test(name)) {
      return res.status(400).json({message: "Invalid Name: Only alphabetic characters and spaces are allowed."});
  }
  if (!phoneRegex.test(phone)) {
      return res.status(400).json({message: "Invalid Phone: Must be exactly 10 digits."});
  }
  if (!emailRegex.test(email)) {
      return res.status(400).json({message: "Invalid Email address."});
  }

  execFile('unified_backend.exe', ['INSERT', name, email, phone], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({message: "Failed to add contact."});
    try {
      res.json(JSON.parse(stdout.trim()));
    } catch {
      res.status(500).json({message: "Invalid JSON from backend."});
    }
  });
});

app.get('/display', (req, res) => {
  execFile('unified_backend.exe', ['DISPLAY'], (err, stdout, stderr) => {
    if (err) return res.status(500).send("Failed to display contacts.");
    try {
      const contacts = JSON.parse(stdout.trim());
      if (!contacts.length) return res.send("No contacts found.");

      let html = "<h2>All Contacts:</h2>";
      contacts.forEach(c => {
        const date = new Date(c.createdAt).toLocaleString();
        html += `<div class="contact-card">
                   <b>${c.name}</b>
                   <span>📧 ${c.email}</span>
                   <span>📱 ${c.phone}</span>
                   <span style="font-size:0.8rem;color:#888;margin-top:10px;">Added: ${date}</span>
                 </div>`;
      });
      res.send(html);
    } catch {
      res.status(500).send("Invalid data from backend.");
    }
  });
});

app.get('/search', (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({message: "Name required."});

  execFile('unified_backend.exe', ['SEARCH', name], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({message: "Search failed."});
    try {
      res.json(JSON.parse(stdout.trim()));
    } catch {
      res.status(500).json({message: "Invalid JSON from backend."});
    }
  });
});

app.delete('/delete', (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({message: "Name required."});

  execFile('unified_backend.exe', ['DELETE', name], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({message: "Delete failed."});
    try {
      res.json(JSON.parse(stdout.trim()));
    } catch {
      res.status(500).json({message: "Invalid JSON from backend."});
    }
  });
});

app.get('/sort', (req, res) => {
  const algo = req.query.algo || 'merge';
  const by = req.query.by || 'name';

  execFile('unified_backend.exe', ['SORT', algo, by], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({message: "Sort failed."});
    try {
      res.json(JSON.parse(stdout.trim()));
    } catch {
      res.status(500).json({message: "Invalid JSON from backend."});
    }
  });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
