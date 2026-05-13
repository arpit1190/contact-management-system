// --- Toast Notification System ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icon based on type
    const icon = type === 'error' ? '❌' : '✅';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// --- Validation Helpers ---
function validateName(name) {
    return /^[a-zA-Z\s]+$/.test(name);
}

function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
}

function validateEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

// --- App Logic ---
function showAdd() {
  const form = document.getElementById("form-section");
  form.innerHTML = `
    <h2>Add Contact</h2>
    <div class="input-group">
      <input type="text" id="name" placeholder="Full Name">
    </div>
    <div class="input-group">
      <input type="email" id="email" placeholder="Email Address">
    </div>
    <div class="input-group">
      <input type="text" id="phone" placeholder="Phone Number">
    </div>
    <button onclick="addContact()"><span class="btn-icon">✨</span> Submit</button>
  `;
  document.getElementById("output").style.display = "none";
  form.style.display = "block";
  hideVisualization();
}

function addContact() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !email || !phone) {
    showToast("Please fill all fields.", "error");
    return;
  }

  // Client-side Validation
  if (!validateName(name)) {
      showToast("Invalid Name: Only alphabetic characters and spaces allowed.", "error");
      return;
  }
  if (!validateEmail(email)) {
      showToast("Invalid Email format.", "error");
      return;
  }
  if (!validatePhone(phone)) {
      showToast("Invalid Phone: Must be exactly 10 digits.", "error");
      return;
  }

  fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone })
  })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to add");
        return data;
    })
    .then(data => {
      document.getElementById("form-section").style.display = "none";
      showToast(data.message, "success");
      displayVisualization(data);
    })
    .catch(err => showToast(err.message, "error"));
}

function displayContacts() {
  hideVisualization();
  document.getElementById("form-section").style.display = "none";
  const output = document.getElementById("output");
  
  fetch("/display")
    .then(res => res.text())
    .then(html => {
      output.style.display = "block";
      output.innerHTML = html;
    })
    .catch(() => showToast("Error displaying contacts.", "error"));
}

function showSearch() {
  const form = document.getElementById("form-section");
  form.innerHTML = `
    <h2>Search Contact</h2>
    <div class="input-group">
      <input type="text" id="searchName" placeholder="Enter Name to Search">
    </div>
    <button onclick="searchContact()"><span class="btn-icon">🔍</span> Search</button>
  `;
  document.getElementById("output").style.display = "none";
  form.style.display = "block";
  hideVisualization();
}

function searchContact() {
  const name = document.getElementById("searchName").value.trim();
  if (!name) return showToast("Enter a name to search.", "error");

  fetch(`/search?name=${encodeURIComponent(name)}`)
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Search failed");
        return data;
    })
    .then(data => {
      const output = document.getElementById("output");
      output.style.display = "block";
      output.innerHTML = `<h3>${data.message}</h3>`;
      displayVisualization(data);
    })
    .catch(err => showToast(err.message, "error"));
}

function showDelete() {
  const form = document.getElementById("form-section");
  form.innerHTML = `
    <h2>Delete Contact</h2>
    <div class="input-group">
      <input type="text" id="deleteName" placeholder="Enter Name to Delete">
    </div>
    <button onclick="deleteContact()"><span class="btn-icon">🗑️</span> Delete</button>
  `;
  document.getElementById("output").style.display = "none";
  form.style.display = "block";
  hideVisualization();
}

function deleteContact() {
  const name = document.getElementById("deleteName").value.trim();
  if (!name) return showToast("Enter a name to delete.", "error");

  fetch(`/delete?name=${encodeURIComponent(name)}`, {
    method: "DELETE"
  })
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Delete failed");
        return data;
    })
    .then(data => {
      document.getElementById("form-section").style.display = "none";
      showToast(data.message, data.message.includes("not found") ? "error" : "success");
      displayVisualization(data);
    })
    .catch(err => showToast(err.message, "error"));
}

function showSort() {
  const form = document.getElementById("form-section");
  form.innerHTML = `
    <h2>Sort Contacts</h2>
    <div class="input-group">
        <label style="display:block;margin-bottom:8px;color:var(--secondary)">Sort Field:</label>
        <select id="sortField">
            <option value="name">Name</option>
            <option value="phone">Phone</option>
            <option value="createdAt">Date Created</option>
        </select>
    </div>
    <div class="input-group">
        <label style="display:block;margin-bottom:8px;color:var(--secondary)">Algorithm:</label>
        <select id="sortAlgo">
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
        </select>
    </div>
    <button onclick="sortContacts()"><span class="btn-icon">⚡</span> Run Sort Engine</button>
  `;
  document.getElementById("output").style.display = "none";
  form.style.display = "block";
  hideVisualization();
}

function sortContacts() {
  const field = document.getElementById("sortField").value;
  const algo = document.getElementById("sortAlgo").value;

  fetch(`/sort?by=${encodeURIComponent(field)}&algo=${encodeURIComponent(algo)}`)
    .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Sort failed");
        return data;
    })
    .then(data => {
      const contacts = data.data;
      const output = document.getElementById("output");
      output.style.display = "block";
      
      let html = `<h2>${data.message}</h2>`;
      if (contacts && contacts.length) {
          contacts.forEach(c => {
            const date = new Date(c.createdAt).toLocaleString();
            html += `<div class="contact-card">
                       <b>${c.name}</b>
                       <span>📧 ${c.email}</span>
                       <span>📱 ${c.phone}</span>
                       <span style="font-size:0.8rem;color:#888;margin-top:10px;">Added: ${date}</span>
                     </div>`;
          });
      } else {
          html += "<p>No contacts found.</p>";
      }
      output.innerHTML = html;
      
      displayVisualization(data, false); // false = don't show tree
      showToast("Sort completed", "success");
    })
    .catch(err => {
      console.error(err);
      showToast(err.message, "error");
    });
}

// --- Visualization Logic ---
function hideVisualization() {
    document.getElementById("visualization-section").style.display = "none";
}

function displayVisualization(data, showTree = true) {
    const section = document.getElementById("visualization-section");
    const logOutput = document.getElementById("log-output");
    const treeDiv = document.getElementById("tree-network");
    const arrayDiv = document.getElementById("array-visualizer");
    
    section.style.display = "block";
    logOutput.innerHTML = "";
    
    if (showTree && data.tree) {
        treeDiv.style.display = "block";
        arrayDiv.style.display = "none";
    } else if (data.snapshots) {
        treeDiv.style.display = "none";
        arrayDiv.style.display = "flex";
        arrayDiv.innerHTML = "";
    } else {
        treeDiv.style.display = "none";
        arrayDiv.style.display = "none";
    }

    // Scroll with slight delay for DOM to catch up
    setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const logs = data.logs || [];
    const snapshots = data.snapshots || [];
    let i = 0;
    
    function showNextStep() {
        if (i < logs.length) {
            logOutput.innerHTML += `<div class="log-line"> > ${logs[i]}</div>`;
            logOutput.scrollTop = logOutput.scrollHeight;
            i++;
            setTimeout(showNextStep, 400); // slightly faster logs
        } else if (showTree && data.tree) {
            renderTree(data.tree);
        }
    }
    
    let snapIdx = 0;
    function showNextSnapshot() {
        if (snapIdx < snapshots.length) {
            renderArray(snapshots[snapIdx]);
            snapIdx++;
            setTimeout(showNextSnapshot, Math.max(800, (logs.length * 400) / snapshots.length)); 
        }
    }
    
    showNextStep();
    if (snapshots.length > 0) {
        showNextSnapshot();
    }
}

function renderArray(arr) {
    const container = document.getElementById("array-visualizer");
    container.innerHTML = "";
    arr.forEach(item => {
        const div = document.createElement("div");
        div.className = "array-block";
        div.innerText = item;
        container.appendChild(div);
    });
}

function renderTree(treeData) {
    const container = document.getElementById('tree-network');
    const nodes = new vis.DataSet(treeData.nodes);
    const edges = new vis.DataSet(treeData.edges);

    const data = { nodes, edges };
    
    const options = {
        layout: {
            hierarchical: {
                direction: "UD",
                sortMethod: "directed",
                nodeSpacing: 150,
                levelSeparation: 100
            }
        },
        physics: false,
        nodes: {
            shape: "box",
            color: {
                background: "rgba(102, 252, 241, 0.1)",
                border: "#66fcf1",
                highlight: {
                    background: "rgba(102, 252, 241, 0.3)",
                    border: "#45a29e"
                }
            },
            font: { color: "#ffffff", size: 16, face: 'Outfit' },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            color: "#45a29e",
            arrows: { to: { enabled: false } },
            width: 2
        }
    };
    
    new vis.Network(container, data, options);
}
