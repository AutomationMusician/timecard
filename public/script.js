let chargeNumbers;
let rows;
let date = new Date();
let id;
let name;

async function main() {
    await getUserData();
    setDate(new Date()); 
    await onDateChange(); // triggers load, createHeader, and createTable
}

function getUrlVars() {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

async function getUserData() {
    id = getUrlVars()["id"];
    if (id != null) {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ _id: id })
        };
        const response = await fetch('/getUser', options);
        const json = await response.json();
        if (json.success)
            name = json.name;
        else
            window.location.replace("/createUser.html");
    }
    else
    {
        window.location.replace("/createUser.html");
    }
}

function createHeader() {
    const header = document.getElementById("header");
    header.textContent = name + "'s Timecard"
    const title = document.getElementById("title");
    title.textContent = name + "'s Timecard"
}

function createTable() {
    document.getElementById("table").innerHTML = "";
    createHead();
    createBody();
    createFooter();
    calculate();
}

function setDate(date) {
    const yyyy = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const MM = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    const dd = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    const dateElement = document.getElementById("date");
    dateElement.value = `${yyyy}-${MM}-${dd}`;
}

async function onDateChange() {
    date = document.getElementById("date").value;
    await load();
    createHeader();
    createTable();
}

function createHead() {
    const table = document.getElementById("table");
    const thead = document.createElement("thead");
    const theadRow = document.createElement("tr");

    const fixedRowContent = ["", "Start Time", "End Time", "Hours"];
    for (let i=0; i<fixedRowContent.length; i++) {
        const td = document.createElement("td");
        td.textContent = fixedRowContent[i];
        theadRow.append(td);
    }

    for (let i=0; i<chargeNumbers.length; i++) {
        const td = document.createElement("td");
        const del = document.createElement("button");
        del.textContent = "X"
        del.style.backgroundColor = "red";
        del.onclick = function() { deleteColumn(i) };
        const input = document.createElement("input");
        input.id = "chargeNum"+i;
        input.type = "text";
        input.value = chargeNumbers[i];
        input.className = "chargeNumHead";
        td.append(del);
        td.append(input);
        theadRow.append(td);
    }
    thead.append(theadRow);
    table.append(thead);
}

function createBody() {
    const table = document.getElementById("table");
    const tbody = document.createElement("tbody");
    for (let i=0; i<rows.length; i++) {
        const tr = document.createElement("tr");
        const delCell = document.createElement("td");
        const del = document.createElement("button");
        del.onclick = function() { deleteRow(i) };
        del.textContent = "X";
        del.style.backgroundColor = "red";
        delCell.append(del);
        const start = createTimeField("start", i, rows[i].start);
        const end = createTimeField("end", i, rows[i].end);
        const hours = document.createElement("td");
        hours.id = "hours"+i;

        tr.append(delCell);
        tr.append(start);
        tr.append(end);
        tr.append(hours);

        for (let j=0; j<chargeNumbers.length; j++) {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "checkbox";
            input.name = "charge" + i;
            input.id = "charge" + i + "," + j;
            input.onchange = calculate;
            input.value = j;
            if (rows[i].chargeNumbers.includes(j))
                input.checked = true;
            td.append(input);
            tr.append(td);
        }
        
        tbody.append(tr);
    }
    table.append(tbody);
}


function createFooter() {
    const table = document.getElementById("table");
    const tbody = document.createElement("tbody");

    // totals row
    const totalsRow = document.createElement("tr");

    const space = document.createElement("td");
    space.colSpan = 3;
    totalsRow.append(space);
    
    const totalHours = document.createElement("td");
    totalHours.id = "totalHours";
    totalsRow.append(totalHours);

    for (let i=0; i<chargeNumbers.length; i++) {
        const td = document.createElement("td");
        td.className = "chargeNumTotal";
        td.id = "chargeNumTotal" + i; 
        totalsRow.append(td);
    }

    tbody.append(totalsRow);

    // buttons row
    const buttonsRow = document.createElement("tr");
    const buttonsTd = document.createElement("td");
    buttonsTd.colSpan = 4 + chargeNumbers.length;
    const buttonsUl = document.createElement("ul");

    const buttons = [
        {
            text: "Add Row",
            onClick: addRow
        },
        {
            text: "Add Column",
            onClick: addColumn
        },
        {
            text: "Save",
            onClick: save
        }
    ];

    for (let i=0; i<buttons.length; i++) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = buttons[i].text;
        button.onclick = buttons[i].onClick; 
        li.append(button);
        buttonsUl.append(li);
    }

    buttonsTd.append(buttonsUl);
    buttonsRow.append(buttonsTd);
    tbody.append(buttonsRow);

    table.append(tbody);
}

function blankRow() {
    return {
        start: "",
        end: "",
        chargeNumbers: [ 0 ]
    };
}

function round2Decimals(number) {
    return Math.round(number * 100) / 100;
}

function deleteRow(rowNum) {
    cacheState();
    rows.splice(rowNum, 1);
    document.getElementById("table").innerHTML = "";
    createTable();
}

function deleteColumn(colNum) {
    cacheState();
    for (let i=0; i<rows.length; i++)
    {
        const index = rows[i].chargeNumbers.indexOf(colNum);
        if (index != -1) // if the row has this chargeNumber checked
        {
            // delete the charge number from the list
            rows[i].chargeNumbers.splice(index, 1);
        }
        // iterate over list of charge numbers in this row
        for (let j=0; j<rows[i].chargeNumbers.length; j++)
        {
            // if charge number index is larger than the charge number that was removed, decrement it
            if (rows[i].chargeNumbers[j] > colNum)
                rows[i].chargeNumbers[j]--;
        }
    }
    chargeNumbers.splice(colNum, 1);
    document.getElementById("table").innerHTML = "";
    createTable();
}

function addRow() {
    cacheState();
    document.getElementById("table").innerHTML = "";
    rows.push(blankRow());
    createTable();
}

function addColumn() {
    cacheState();
    document.getElementById("table").innerHTML = "";
    chargeNumbers.push("Charge #" + (chargeNumbers.length + 1));
    createTable();
}

function cacheState() {
    // cache rows
    const rowsTemp = [];
    for (let row=0; row<rows.length; row++) {
        const start = document.getElementById("start" + row).value;
        const end = document.getElementById("end" + row).value;
        const chargeNumbers = getChargeNums(row);
        rowsTemp.push({ start, end, chargeNumbers });
    }

    // cache chargeNumbers
    const chargeNumsTemp = [];
    for (let i=0; i<chargeNumbers.length; i++) {
        const value = document.getElementById("chargeNum"+i).value;
        chargeNumsTemp.push(value);
    }

    // replace global variables
    rows = rowsTemp;
    chargeNumbers = chargeNumsTemp;
}

async function load() {
    console.log('loading ' + `/load/${id}/${date}`);
    const response = await fetch(`/load/${id}/${date}`);
    const result = await response.json();

    if (result.chargeNumbers == null) {
        chargeNumbers = ["Charge #1", "Charge #2", "Charge #3"];
    } else {
        chargeNumbers = result.chargeNumbers;
    }

    if (result.rows == null) {
        rows = [
            blankRow(),
            blankRow(),
            blankRow()
        ];
    } else {
        rows = result.rows;
    }
}

async function save() {
    cacheState();
    calculate();
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, chargeNumbers, rows, date })
    };
    const response = await fetch('/save', options);
    return await response.json();
}

function createTimeField(fieldStr, index, value) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "time"
    input.value = value;
    input.id = fieldStr + index;
    input.onchange = calculate;
    const nowButton = document.createElement("button");
    nowButton.onclick = function() { 
        setNow(fieldStr, index);
        calculate();
    };
    nowButton.textContent = "now";
    td.append(input);
    td.append(document.createElement("br"));
    td.append(nowButton);
    return td;
}

function setNow(fieldStr, index) {
    const elem = document.getElementById(fieldStr + index);
    const now = new Date();
    const time = ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
    elem.value = time;
}

function hoursDifference(start, end) {
    if (start === "" || end === "")
        return 0;
    const timeStart = new Date("01/01/1970 " + start);
    const timeEnd = new Date("01/01/1970 " + end);
    const difference = timeEnd - timeStart;
    return difference/3600000;
}

function getChargeNums(row) {
    const chargeNums = [];
    for (let index=0; index < chargeNumbers.length; index++) {
        const id = "charge" + row + "," + index;
        const checkbox = document.getElementById(id);
        if (checkbox.checked) {
            chargeNums.push(index);
        }
    }
    return chargeNums;
}

function calculate() {
    let totalHours = 0;
    const chargeNumHours = []; 
    for (let index=0; index<chargeNumbers.length; index++)
        chargeNumHours.push(0);
    for (let row=0; row<rows.length; row++) {
        const start = document.getElementById("start" + row).value;
        const end = document.getElementById("end" + row).value;
        const time = hoursDifference(start, end);
        totalHours += time;

        const hoursTd = document.getElementById("hours"+row);
        hoursTd.textContent = round2Decimals(time);

        const checked = getChargeNums(row);
        if (checked.length != 0)
        {
            const timeFraction = time/checked.length;
            checked.forEach((value) =>
            {
                chargeNumHours[value] += timeFraction;
            });
        }
    }
    
    for (let index=0; index<chargeNumbers.length; index++) {
        const hoursTd = document.getElementById("chargeNumTotal" + index);
        hoursTd.textContent = round2Decimals(chargeNumHours[index]);
    }

    const totalHoursElem = document.getElementById("totalHours");
    totalHoursElem.textContent = round2Decimals(totalHours);
}

main();