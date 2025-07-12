function showAdd() {
  const form = document.getElementById("form-section");
  form.innerHTML = `
    <h2>Add Contact</h2>
    <input type="text" id="name" placeholder="Name"><br><br>
    <input type="email" id="email" placeholder="Email"><br><br>
    <input type="text" id="phone" placeholder="Phone"><br><br>
    <button onclick="addContact()">Submit</button>
  `;
  document.getElementById("output").innerHTML = "";
}

function addContact() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !email || !phone) {
    alert("Please fill all fields.");
    return;
  }

  fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      document.getElementById("form-section").innerHTML = "";
    })
    .catch(() => alert("Error adding contact."));
}

function displayContacts() {
  fetch("/display")
    .then(res => res.text())
    .then(html => {
      document.getElementById("output").innerHTML = html;
    })
    .catch(() => alert("Error displaying contacts."));
}

function showSearch() {
  const form = document.getElementById("form-section");
  form.innerHTML = `
    <h2>Search Contact</h2>
    <input type="text" id="searchName" placeholder="Enter Name to Search"><br><br>
    <button onclick="searchContact()">Search</button>
  `;
  document.getElementById("output").innerHTML = "";
}

function searchContact() {
  const name = document.getElementById("searchName").value.trim();
  if (!name) return alert("Enter a name to search.");

  fetch(`/search?name=${encodeURIComponent(name)}`)
    .then(res => res.text())
    .then(msg => {
      document.getElementById("output").innerHTML = `<pre>${msg}</pre>`;
    })
    .catch(() => alert("Search failed."));
}

function showDelete() {
  const form = document.getElementById("form-section");
  form.innerHTML = `
    <h2>Delete Contact</h2>
    <input type="text" id="deleteName" placeholder="Enter Name to Delete"><br><br>
    <button onclick="deleteContact()">Delete</button>
  `;
  document.getElementById("output").innerHTML = "";
}

function deleteContact() {
  const name = document.getElementById("deleteName").value.trim();
  if (!name) return alert("Enter a name to delete.");

  fetch(`/delete?name=${encodeURIComponent(name)}`, {
    method: "DELETE"
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      document.getElementById("form-section").innerHTML = "";
      displayContacts(); // optional refresh
    })
    .catch(() => alert("Delete failed."));
}
