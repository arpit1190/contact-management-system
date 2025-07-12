#include <iostream>
#include <fstream>
#include <string>
#include "json.hpp" // This will handle reading/writing JSON
using namespace std;
using json = nlohmann::json;
int main(int argc, char* argv[]) {
    if (argc != 4) {
        cerr << "Usage: <name> <email> <phone>" << endl;
        return 1;
    }

    string name = argv[1];
    string email = argv[2];
    string phone = argv[3];

    json contacts = json::array();

    // Read existing data
    ifstream in("data.json");
    if (in) {
        try {
            in >> contacts;
        } catch (...) {
            contacts = json::array();
        }
    }
    in.close();

    // Add new contact
    json newContact = {
        {"name", name},
        {"email", email},
        {"phone", phone}
    };
    contacts.push_back(newContact);

    // Save to file
    ofstream out("data.json");
    out << contacts.dump(4);
    out.close();

    return 0;
}
