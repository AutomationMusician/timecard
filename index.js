const express = require('express');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 2999;
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

if (!fs.existsSync("data")) {
    fs.mkdirSync("data");
}

function formateDate(date) {
    const yyyy = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const MM = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    const dd = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    return `${yyyy}-${MM}-${dd}`;
}

app.post('/save', async (request, response) => {
    const directory = "data/" + request.body.id + "/";
    const data = {
        chargeNumbers: request.body.chargeNumbers,
        rows: request.body.rows
    };
    if (request.body.date === formateDate(new Date())) {
        fs.writeFile(directory + request.body.date + ".json", JSON.stringify(data, null, 4), (err) => {
            if (err) { 
                throw err;
            } else {
                console.log(request.body.date + ".json file is created successfully.");
                fs.writeFile(directory + "chargeNumbers.json", JSON.stringify(request.body.chargeNumbers, null, 4), (err) => {
                    if (err) { 
                        throw err;
                    } else {
                        console.log("chargeNumbers.json file is created successfully.");
                        response.json({ status: "success" });
                    }
                });
            }
        });
    }
    else {
        console.error("Save refused. Cannot save if the provided date is not today.");
        response.status(400).json({ status: "failure" });
    }
    
});

app.get('/load/:id/:date', async (request, response) => {
    let state;
    const directory = "data/" + request.params.id + "/";
    const currentDateFile = directory + request.params.date + ".json";
    if (fs.existsSync(currentDateFile)) {
        const rawdata = fs.readFileSync(currentDateFile);
        state = JSON.parse(rawdata);
    } else if (fs.existsSync(directory + "chargeNumbers.json")) {
        const rawdata = fs.readFileSync(directory + "chargeNumbers.json");
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

app.post('/createUser', async (request, response) => {
    let directory, token;
    let directoryExists;
    do {
        const promise = new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buffer) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(buffer.toString('hex'));
                }
            })
        });
        token = await promise;
        directory = "data/" + token + "/";
        directoryExists = fs.existsSync(directory);
    } while (directoryExists);
    fs.mkdirSync(directory);

    fs.writeFile(directory + "name.txt", request.body.name, (err) => {
        if (err) { 
            response.status(400).json({ status: JSON.stringify(err) });
            throw err;
        } else {
            response.redirect("/?id=" + token);
        }
    });
});

app.get('/getUser/:id', async (request, response) => {
    const directory = "data/" + request.params.id + "/";
    fs.readFile(directory + "name.txt", "utf8", (err, name) => {
        if (err) {
            response.status(500).json(err);
        }
        else {
            response.json({ success: true, name: name });
        }
    });
});