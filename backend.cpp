#include <iostream>
#include <string>
#include <sstream>
using namespace std;

struct Contact {
    string name, email, phone;
    Contact *left = nullptr, *right = nullptr;
    Contact(string n, string e, string p) : name(n), email(e), phone(p) {}
};

class BST {
    Contact* root = nullptr;

    Contact* insert(Contact* node, string name, string email, string phone) {
        if (!node) return new Contact(name, email, phone);
        if (name < node->name) node->left = insert(node->left, name, email, phone);
        else node->right = insert(node->right, name, email, phone);
        return node;
    }

    Contact* search(Contact* node, string name) {
        if (!node || node->name == name) return node;
        return name < node->name ? search(node->left, name) : search(node->right,name);
    }

    Contact* findMin(Contact* node) {
        while (node && node->left) node = node->left;
        return node;
    }

    Contact* deleteNode(Contact* node, string name) {
        if (!node) return node;
        if (name < node->name) node->left = deleteNode(node->left, name);
        else if (name > node->name) node->right = deleteNode(node->right, name);
        else {
            if (!node->left) return node->right;
            if (!node->right) return node->left;
            Contact* temp = findMin(node->right);
            node->name = temp->name;
            node->email = temp->email;
            node->phone = temp->phone;
            node->right = deleteNode(node->right, temp->name);
        }
        return node;
    }

    void inorder(Contact* node) {
        if (!node) return;
        inorder(node->left);
        cout << node->name << " | " << node->email << " | " << node->phone << endl;
        inorder(node->right);
    }

public:
    void insert(string name, string email, string phone) {
        root = insert(root, name, email, phone);
    }

    void remove(string name) {
        root = deleteNode(root, name);
    }

    void searchAndPrint(string name) {
        Contact* found = search(root, name);
        if (found)
            cout << "Found: " << found->name << " | " << found->email << " | " << found->phone << endl;
        else
            cout << "Contact not found." << endl;
    }

    void inorder() {
        inorder(root);
    }
};

int main() {
    BST bst;
    string line;

    while (getline(cin, line)) {
        if (line.empty()) continue;

        istringstream iss(line);
        string cmd;
        iss >> cmd;

        if (cmd == "ADD") {
            string name, email, phone;
            iss >> name >> email >> phone;

            // remaining string is name with spaces (if any)
            string leftover;
            getline(iss, leftover);
            leftover = leftover.substr(leftover.find_first_not_of(" \t"));

            if (!leftover.empty()) name += " " + leftover;

            bst.insert(name, email, phone);
        } else if (cmd == "DEL") {
            string name;
            getline(iss, name);
            name = name.substr(name.find_first_not_of(" \t"));
            bst.remove(name);
        } else if (cmd == "SEARCH") {
            string name;
            getline(iss, name);
            name = name.substr(name.find_first_not_of(" \t"));
            bst.searchAndPrint(name);
        } else if (cmd == "DISPLAY") {
            cout << "All Contacts:\n";
            bst.inorder();
        }
    }

    return 0;
}
