async function generateKey() {
    try {
        const key = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
        const exportedKey = await window.crypto.subtle.exportKey("raw", key);
        const keyString = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
        alert(`Your encryption key: ${keyString}`);
        return keyString;
    } catch (e) {
        console.error("Key generation failed: ", e.message);
        alert("An error occurred during key generation. Please try again.");
    }
};



function sendRequest(endpoint, data) {
    return fetch(`http://localhost:3000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error in sendRequest:', error);
        alert(`An error occurred: ${error.message}`);
    });
};


// Function to generate a random hex string of the given length
function generateHexKey(length) {
    const arr = new Uint8Array(length / 2); // each byte will become two hex characters
    window.crypto.getRandomValues(arr);
    return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
};


// Function to encrypt text
// Function to validate input text and key
function validateInput(text, key) {
    if (!text) {
        alert("Please enter text.");
        return false;
    }
    if (!key || !/^[a-f0-9]{64}$/.test(key)) {
        alert("Invalid key format. The key must be a 64-character hexadecimal string.");
        return false;
    }
    return true;
}

// Updated encrypt function
function encrypt() {
    const inputText = document.getElementById('inputText').value;
    const userKey = generateHexKey(64);

    if (!validateInput(inputText, userKey)) return;

    document.getElementById('key').value = userKey;
    sendRequest('encrypt', { text: inputText, key: userKey })
        .then(data => document.getElementById('output').innerText = 'Encrypted: ' + JSON.stringify(data));
}

// Updated decrypt function
function decrypt() {
    const encryptedData = document.getElementById('inputText').value;
    const userKey = document.getElementById('key').value;

    if (!validateInput(encryptedData, userKey)) return;

    sendRequest('decrypt', { hash: JSON.parse(encryptedData), key: userKey })
        .then(data => document.getElementById('output').innerText = 'Decrypted: ' + data.decryptedText)
        .catch(error => {
            console.error('Error in decryption:', error);
            alert("Error processing the decryption. Check the encrypted data format.");
        });
}

