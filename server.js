const express = require('express');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public')); // Your frontend files (index.html, script.js, style.css)

// ✅ ADD contact using Windows C++ binary (add_contact.exe)
app.post('/add', (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).send("All fields are required.");
  }

  // Windows-friendly: run add_contact.exe
  execFile('add_contact.exe', [name, email, phone], (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error from C++:", stderr || err.message);
      return res.status(500).send("Failed to add contact.");
    }

    console.log("✅ Contact added:", stdout.trim());
    res.send("Contact added successfully.");
  });
});

// ✅ DISPLAY all contacts from data.json
app.get('/display', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err || !data || data.trim() === '[]') {
      return res.send("No contacts found.");
    }

    try {
      const contacts = JSON.parse(data);
      if (!contacts.length) return res.send("No contacts found.");

      let html = "<h2>All Contacts:</h2>";
      contacts.forEach(c => {
        html += `<p><b>${c.name}</b><br>Email: ${c.email}<br>Phone: ${c.phone}</p><hr>`;
      });
      res.send(html);
    } catch (e) {
      console.error("❌ Invalid JSON in data.json");
      res.send("Invalid contact data.");
    }
  });
});

app.get('/search', (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).send("Name required.");
  const filePath = path.join(__dirname, 'data.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.send("Could not read data.");
    try {
      const contacts = JSON.parse(data);
      const found = contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (found) {
        res.send(`Found:\n${found.name} | ${found.email} | ${found.phone}`);
      } else {
        res.send("Contact not found.");
      }
    } catch {
      res.send("Error parsing contact data.");
    }
  });
});

app.delete('/delete', (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).send("Name required.");

  const filePath = path.join(__dirname, 'data.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.send("Could not read contacts.");
    try {
      let contacts = JSON.parse(data);
      const originalLength = contacts.length;
      contacts = contacts.filter(c => c.name.toLowerCase() !== name.toLowerCase());

      if (contacts.length === originalLength) {
        return res.send("No contact found to delete.");
      }

      fs.writeFile(filePath, JSON.stringify(contacts, null, 4), err => {
        if (err) return res.send("Failed to save changes.");
        res.send(`Deleted contact: ${name}`);
      });
    } catch {
      res.send("Error handling data.");
    }
  });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
