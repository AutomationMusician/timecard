const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

function getDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    return yyyy + "-" + mm + "-" + dd;
}

app.post('/save', async (request, response) => {
    fs.writeFile("data/"+getDate()+".json", JSON.stringify(request.body), (err) => {
        if (err) { 
            throw err;
        } else {
            console.log(getDate()+".json file is created successfully.");
            fs.writeFile("data/chargeNumbers.json", JSON.stringify(request.body.chargeNumbers), (err) => {
                if (err) { 
                    throw err;
                } else {
                    console.log("chargeNumbers.json file is created successfully.");
                    response.json({ status: "success" });
                }
            });
        }
    });
    
});

app.post('/load', async (request, response) => {
    let state;
    if (fs.existsSync("data/"+getDate()+".json")) {
        const rawdata = fs.readFileSync("data/"+getDate()+".json");
        state = JSON.parse(rawdata);
    } else if (fs.existsSync("data/chargeNumbers.json")) {
        const rawdata = fs.readFileSync("data/chargeNumbers.json");
        const chargeNumbers = JSON.parse(rawdata);
        state = { 
            "chargeNumbers": chargeNumbers,
            "rows": null
        };
    } else {
        state = { 
            "chargeNumbers": null,
            "rows": null
        };
    }
    response.json(state);
});
