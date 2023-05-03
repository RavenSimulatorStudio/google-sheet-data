const express = require("express");
const {google} = require("googleapis");
const { datacatalog } = require("googleapis/build/src/apis/datacatalog");

const app = express();

app.get("/approved-data/:range", async (req, res) => {  
    // Parameters
    const range = req.params['range'];
    const workshop = req.query.workshop;

    // Generate google sheet auth
    const auth = new google.auth.GoogleAuth({
        keyFile: "I:/website/root/json/credentials.json", 
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient();

    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = "1GLRwvvcbUKGW_NSRzjzGUZAl-MoX4gSaXmbqUEQP4kk";

    // Get data
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: range, //'Approved!A2:J
    });
    const data = getRows.data.values;

    // Check query params
    let filteredData = [];
    let numberOfRow = 0;
    if (workshop) {
        for (let i = 0; i < data.length; i++) {
            if (data[i][7] === workshop) {
                filteredData.push(data[i])
            }
        }
        numberOfRow = filteredData.length
    } else {
        filteredData = data
        numberOfRow = data.length
    };

    // Response
    const headers = data[0];
    const result = filteredData.map((row) => {
        return headers.reduce((obj, key, index) => ({ ...obj, [key]: row[index] }), {});
    });
    res.status(200).send({
        numberOfRow: numberOfRow,
        data: result,
    })
});
