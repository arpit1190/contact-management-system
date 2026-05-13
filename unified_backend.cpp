#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <chrono>
#include <algorithm>
#include "json.hpp"

using json = nlohmann::json;
using namespace std;

// Contact structure
struct Contact {
    string name;
    string email;
    string phone;
    long long createdAt;
};

// --- Helper Functions ---
long long getCurrentTime() {
    return chrono::duration_cast<chrono::milliseconds>(
               chrono::system_clock::now().time_since_epoch())
        .count();
}

string toLower(string s) {
    string res = s;
    transform(res.begin(), res.end(), res.begin(), ::tolower);
    return res;
}

vector<Contact> loadContacts() {
    ifstream file("data.json");
    vector<Contact> contacts;
    if (file.is_open()) {
        json j;
        try {
            file >> j;
            for (auto& item : j) {
                Contact c;
                c.name = item.value("name", "");
                c.email = item.value("email", "");
                c.phone = item.value("phone", "");
                c.createdAt = item.value("createdAt", 0LL);
                contacts.push_back(c);
            }
        } catch (...) {}
        file.close();
    }
    return contacts;
}

void saveContacts(const vector<Contact>& contacts) {
    json j = json::array();
    for (const auto& c : contacts) {
        j.push_back({
            {"name", c.name},
            {"email", c.email},
            {"phone", c.phone},
            {"createdAt", c.createdAt}
        });
    }
    ofstream file("data.json");
    file << j.dump(4);
    file.close();
}

// --- BST Implementation ---
struct TreeNode {
    Contact contact;
    TreeNode* left;
    TreeNode* right;
    TreeNode(Contact c) : contact(c), left(nullptr), right(nullptr) {}
};

class BST {
public:
    TreeNode* root;
    BST() : root(nullptr) {}

    void insert(Contact c, vector<string>& logs) {
        root = insertRec(root, c, logs);
    }

    TreeNode* insertRec(TreeNode* node, Contact c, vector<string>& logs) {
        if (node == nullptr) {
            logs.push_back("Found empty spot. Inserting '" + c.name + "' here.");
            return new TreeNode(c);
        }
        logs.push_back("Comparing '" + c.name + "' with '" + node->contact.name + "'...");
        if (toLower(c.name) < toLower(node->contact.name)) {
            logs.push_back("'" + c.name + "' < '" + node->contact.name + "'. Moving to LEFT child.");
            node->left = insertRec(node->left, c, logs);
        }
        else if (toLower(c.name) > toLower(node->contact.name)) {
            logs.push_back("'" + c.name + "' > '" + node->contact.name + "'. Moving to RIGHT child.");
            node->right = insertRec(node->right, c, logs);
        } else {
            logs.push_back("'" + c.name + "' equals '" + node->contact.name + "'. Not inserting duplicate name.");
        }
        return node;
    }

    TreeNode* search(string name, vector<string>& logs) {
        return searchRec(root, name, logs);
    }

    TreeNode* searchRec(TreeNode* node, string name, vector<string>& logs) {
        if (node == nullptr) {
            logs.push_back("Reached an empty leaf. Contact '" + name + "' not found in BST.");
            return nullptr;
        }
        logs.push_back("Comparing with '" + node->contact.name + "'...");
        string nName = toLower(node->contact.name);
        string sName = toLower(name);
        if (nName == sName) {
            logs.push_back("Match found! Returning contact details.");
            return node;
        }
        if (sName < nName) {
            logs.push_back("'" + name + "' < '" + node->contact.name + "'. Moving LEFT.");
            return searchRec(node->left, name, logs);
        }
        logs.push_back("'" + name + "' > '" + node->contact.name + "'. Moving RIGHT.");
        return searchRec(node->right, name, logs);
    }

    void remove(string name, Contact& deletedContact, bool& found, vector<string>& logs) {
        root = removeRec(root, name, deletedContact, found, logs);
    }

    TreeNode* removeRec(TreeNode* node, string name, Contact& deletedContact, bool& found, vector<string>& logs) {
        if (node == nullptr) {
            logs.push_back("Node not found for deletion.");
            return node;
        }
        string nName = toLower(node->contact.name);
        string sName = toLower(name);

        logs.push_back("Visiting node '" + node->contact.name + "'...");

        if (sName < nName) {
            logs.push_back("Target is smaller. Going LEFT.");
            node->left = removeRec(node->left, name, deletedContact, found, logs);
        }
        else if (sName > nName) {
            logs.push_back("Target is greater. Going RIGHT.");
            node->right = removeRec(node->right, name, deletedContact, found, logs);
        }
        else {
            logs.push_back("Found the node to delete: '" + node->contact.name + "'.");
            if (!found) {
                deletedContact = node->contact;
                found = true;
            }
            if (node->left == nullptr) {
                logs.push_back("Node has no left child. Replacing with right child.");
                TreeNode* temp = node->right;
                delete node;
                return temp;
            } else if (node->right == nullptr) {
                logs.push_back("Node has no right child. Replacing with left child.");
                TreeNode* temp = node->left;
                delete node;
                return temp;
            }
            logs.push_back("Node has two children. Finding minimum value in the right subtree to substitute.");
            TreeNode* temp = minValueNode(node->right);
            logs.push_back("Substituting node with '" + temp->contact.name + "'.");
            node->contact = temp->contact;
            bool dummyFound = false;
            Contact dummy;
            vector<string> dummyLogs;
            node->right = removeRec(node->right, temp->contact.name, dummy, dummyFound, dummyLogs);
        }
        return node;
    }

    TreeNode* minValueNode(TreeNode* node) {
        TreeNode* current = node;
        while (current && current->left != nullptr)
            current = current->left;
        return current;
    }

    void getInOrder(TreeNode* node, vector<Contact>& out) {
        if (node != nullptr) {
            getInOrder(node->left, out);
            out.push_back(node->contact);
            getInOrder(node->right, out);
        }
    }
};

void serializeTree(TreeNode* node, json& nodes, json& edges, int& idCounter, int parentId = -1) {
    if (node == nullptr) return;
    
    int currentId = idCounter++;
    nodes.push_back({
        {"id", currentId},
        {"label", node->contact.name}
    });
    
    if (parentId != -1) {
        edges.push_back({
            {"from", parentId},
            {"to", currentId}
        });
    }
    
    serializeTree(node->left, nodes, edges, idCounter, currentId);
    serializeTree(node->right, nodes, edges, idCounter, currentId);
}

json getTreeJson(BST& bst) {
    json nodes = json::array();
    json edges = json::array();
    int idCounter = 1;
    serializeTree(bst.root, nodes, edges, idCounter);
    json tree;
    tree["nodes"] = nodes;
    tree["edges"] = edges;
    return tree;
}

// --- Sorting Algorithms ---
bool compareContacts(const Contact& a, const Contact& b, const string& by) {
    if (by == "name") return toLower(a.name) < toLower(b.name);
    if (by == "phone") return a.phone < b.phone;
    if (by == "createdAt") return a.createdAt < b.createdAt;
    return toLower(a.name) < toLower(b.name);
}

json getSnapshot(const vector<Contact>& arr) {
    json j = json::array();
    for (const auto& c : arr) {
        j.push_back(c.name);
    }
    return j;
}

void merge(vector<Contact>& arr, int l, int m, int r, const string& by, vector<string>& logs, vector<json>& snapshots) {
    logs.push_back("Merging subarrays: [" + to_string(l) + "..." + to_string(m) + "] and [" + to_string(m+1) + "..." + to_string(r) + "]");
    int n1 = m - l + 1;
    int n2 = r - m;
    vector<Contact> L(n1), R(n2);
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (compareContacts(L[i], R[j], by) || (!compareContacts(L[i], R[j], by) && !compareContacts(R[j], L[i], by))) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
    
    logs.push_back("Merged successfully.");
    snapshots.push_back(getSnapshot(arr));
}

void mergeSort(vector<Contact>& arr, int l, int r, const string& by, vector<string>& logs, vector<json>& snapshots) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m, by, logs, snapshots);
    mergeSort(arr, m + 1, r, by, logs, snapshots);
    merge(arr, l, m, r, by, logs, snapshots);
}

int partition(vector<Contact>& arr, int low, int high, const string& by, vector<string>& logs, vector<json>& snapshots) {
    Contact pivot = arr[high];
    logs.push_back("Partitioning with pivot: '" + pivot.name + "'");
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (compareContacts(arr[j], pivot, by)) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    logs.push_back("Placed pivot '" + pivot.name + "' at correct position.");
    snapshots.push_back(getSnapshot(arr));
    return (i + 1);
}

void quickSort(vector<Contact>& arr, int low, int high, const string& by, vector<string>& logs, vector<json>& snapshots) {
    if (low < high) {
        int pi = partition(arr, low, high, by, logs, snapshots);
        quickSort(arr, low, pi - 1, by, logs, snapshots);
        quickSort(arr, pi + 1, high, by, logs, snapshots);
    }
}


// --- Main Logic ---
int main(int argc, char* argv[]) {
    if (argc < 2) {
        cout << "Usage: unified_backend <COMMAND> [args]" << endl;
        return 1;
    }

    string command = argv[1];

    if (command == "INSERT" && argc >= 5) {
        Contact c;
        c.name = argv[2];
        c.email = argv[3];
        c.phone = argv[4];
        c.createdAt = getCurrentTime();

        auto contacts = loadContacts();
        BST bst;
        vector<string> dummy;
        for (const auto& existing : contacts) bst.insert(existing, dummy);
        
        vector<string> logs;
        logs.push_back("Starting INSERT operation for: " + c.name);
        bst.insert(c, logs);
        
        vector<Contact> out;
        bst.getInOrder(bst.root, out);
        saveContacts(out);
        
        json result;
        result["message"] = "Contact added: " + c.name;
        result["logs"] = logs;
        result["tree"] = getTreeJson(bst);
        
        cout << result.dump();
    } 
    else if (command == "SEARCH" && argc >= 3) {
        string name = argv[2];
        auto contacts = loadContacts();
        BST bst;
        vector<string> dummy;
        for (const auto& existing : contacts) bst.insert(existing, dummy);
        
        vector<string> logs;
        logs.push_back("Starting SEARCH operation for: " + name);
        TreeNode* found = bst.search(name, logs);
        
        json result;
        if (found) {
            result["message"] = "Found: " + found->contact.name + " | " + found->contact.email + " | " + found->contact.phone;
        } else {
            result["message"] = "Contact not found.";
        }
        result["logs"] = logs;
        result["tree"] = getTreeJson(bst);
        
        cout << result.dump();
    } 
    else if (command == "DELETE" && argc >= 3) {
        string name = argv[2];
        auto contacts = loadContacts();
        BST bst;
        vector<string> dummy;
        for (const auto& existing : contacts) bst.insert(existing, dummy);
        
        Contact deletedContact;
        bool found = false;
        vector<string> logs;
        logs.push_back("Starting DELETE operation for: " + name);
        bst.remove(name, deletedContact, found, logs);
        
        json result;
        if (found) {
            // We removed pushing to undo stack as user wants Undo removed.
            vector<Contact> out;
            bst.getInOrder(bst.root, out);
            saveContacts(out);
            result["message"] = "Deleted contact: " + deletedContact.name;
        } else {
            result["message"] = "Contact not found to delete.";
        }
        result["logs"] = logs;
        result["tree"] = getTreeJson(bst);
        
        cout << result.dump();
    }
    else if (command == "DISPLAY") {
        auto contacts = loadContacts();
        BST bst;
        vector<string> dummy;
        for (const auto& existing : contacts) bst.insert(existing, dummy);
        
        vector<Contact> out;
        bst.getInOrder(bst.root, out);
        
        json j = json::array();
        for (const auto& c : out) {
            j.push_back({
                {"name", c.name},
                {"email", c.email},
                {"phone", c.phone},
                {"createdAt", c.createdAt}
            });
        }
        cout << j.dump();
    }
    else if (command == "SORT" && argc >= 4) {
        string algo = argv[2]; // "merge" or "quick"
        string by = argv[3];   // "name", "phone", "createdAt"

        auto contacts = loadContacts();
        vector<string> logs;
        vector<json> snapshots;
        
        logs.push_back("Starting " + algo + " sort by " + by + "...");
        snapshots.push_back(getSnapshot(contacts));
        
        auto start = chrono::high_resolution_clock::now();
        
        if (algo == "merge") {
            if (!contacts.empty()) mergeSort(contacts, 0, contacts.size() - 1, by, logs, snapshots);
        } else if (algo == "quick") {
            if (!contacts.empty()) quickSort(contacts, 0, contacts.size() - 1, by, logs, snapshots);
        }
        
        auto end = chrono::high_resolution_clock::now();
        double time_taken = chrono::duration_cast<chrono::nanoseconds>(end - start).count() / 1000000.0;

        json j = json::array();
        for (const auto& c : contacts) {
            j.push_back({
                {"name", c.name},
                {"email", c.email},
                {"phone", c.phone},
                {"createdAt", c.createdAt}
            });
        }
        
        logs.push_back("Sort completed successfully.");
        
        json result;
        result["data"] = j;
        result["message"] = "Sorted Contacts (Time taken: " + to_string(time_taken) + " ms)";
        result["logs"] = logs;
        result["snapshots"] = snapshots;
        
        cout << result.dump();
    }
    else {
        cout << "INVALID_COMMAND";
    }

    return 0;
}
