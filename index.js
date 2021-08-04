const express = require('express');
const datastore = require('nedb');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

const usersdb = new datastore('data/users.db');
usersdb.loadDatabase();

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
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }

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
    usersdb.insert(request.body, (err, data) => {
        if (err) throw err;
        response.redirect("/?id=" + data._id);
    });
});

app.post('/getUser', async (request, response) => {
    usersdb.findOne(request.body, (err, data) => {
        if (err) {
            console.log(err);
            response.json({success: false});
        } else {
            response.json({success: true, name: data.name});
        }
    });
});