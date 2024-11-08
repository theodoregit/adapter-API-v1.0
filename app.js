// Import required modules
const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');

// Request xml
const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://soap.jee.mcnz.com/">
        <soapenv:Header/>
        <soapenv:Body>
            <soap:getTxnRequest>
                <soap:dracct>1000161670317</soap:dracct>
                <soap:cracct>1000095047444</soap:cracct>
                <soap:amount>100.00</soap:amount>
                <soap:date>20241108</soap:date>
                <soap:narrative>tax</soap:narrative>
            </soap:getTxnRequest>
        </soapenv:Body>
    </soapenv:Envelope>
`;

const originalData = {
    "SOAP-ENV:Envelope": {
        "$": {
            "xmlns:SOAP-ENV": "http://schemas.xmlsoap.org/soap/envelope/"
        },
        "SOAP-ENV:Header": "",
        "SOAP-ENV:Body": {
            "ns2:getTxnResponse": {
                "$": {
                    "xmlns:ns2": "http://soap.jee.mcnz.com/"
                },
                "ns2:txn": {
                    "ns2:date": "20241108",
                    "ns2:txnref": "FT253696TDF"
                }
            }
        }
    }
};


// Create an Express application
const app = express();


// Function to remove special characters from keys
function removeSpecialChars(obj) {
    const result = {};
    for (let key in obj) {
        const newKey = key.replace(/[-:]/g, ''); // Removing hyphens and colons
        if (typeof obj[key] === 'object') {
            result[newKey] = removeSpecialChars(obj[key]);
        } else {
            result[newKey] = obj[key];
        }
    }
    return result;
}

// Modified JSON data without special characters
const modifiedData = removeSpecialChars(originalData);

// Accessing data from the modified JSON
const transactionData = modifiedData.SOAPENVEnvelope.SOAPENVBody.ns2getTxnResponse.ns2txn;
const transactionDate = transactionData.ns2date;
const transactionRef = transactionData.ns2txnref;

console.log("Transaction Date: " + transactionDate);
console.log("Transaction Reference: " + transactionRef);

axios.post('http://localhost:8080/teddy/score.wsdl', soapEnvelope, {
    headers: {
        'Content-Type': 'text/xml',
        'SOAPAction': 'getTxn'
    }
}).then(res => {
    console.log(res.data);
    xml2js.parseString(res.data, {explicitArray: false}, (err, result) => {
        if(err) {
            console.error(err);           
        } else {
            const jsonResponse = JSON.stringify(result);
                        
            const modifiedData = removeSpecialChars(JSON.parse(jsonResponse));
            
            console.log(jsonResponse);
            console.log(originalData);
            
            
            // Accessing data from the modified JSON
            const transactionData = modifiedData.SOAPENVEnvelope.SOAPENVBody.ns2getTxnResponse.ns2txn;
            const transactionDate = transactionData.ns2date;
            const transactionRef = transactionData.ns2txnref;

            console.log("Transaction Date: " + transactionDate);
            console.log("Transaction Reference: " + transactionRef);
        }
    })
}).catch(err => {
    console.error(err);    
})


// Define a route that responds with "Hello, World!"
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});