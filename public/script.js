
let chargeNumbers = ["Charge #1", "Charge #2", "Charge #3"];
let rows = [
    {
        start: "07:00",
        end: "09:00",
        charge: 0
    },
    {
        start: "10:00",
        end: "12:00",
        charge: 1
    },
    {
        start: "12:00",
        end: "12:30",
        charge: -1
    },
    {
        start: "12:30",
        end: "18:30",
        charge: 2
    }
];

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
            input.type = "radio";
            input.name = "charge" + i;
            input.id = "charge" + i + "," + j;
            input.value = j;
            if (j == rows[i].charge)
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

    let li, button;

    // Add row
    li = document.createElement("li");
    button = document.createElement("button");
    button.textContent = "Add Row";
    button.onclick = function() { addRow() }; 
    li.append(button);
    buttonsUl.append(li);

    // Add col
    li = document.createElement("li");
    button = document.createElement("button");
    button.textContent = "Add Column";
    button.onclick = function() { addColumn() }; 
    li.append(button);
    buttonsUl.append(li);

    // calculate
    li = document.createElement("li");
    button = document.createElement("button");
    button.textContent = "Calculate";
    button.onclick = function() { calculate() }; 
    li.append(button);
    buttonsUl.append(li);

    buttonsTd.append(buttonsUl);
    buttonsRow.append(buttonsTd);
    tbody.append(buttonsRow);

    table.append(tbody);
}

function createTable() {
    createHead();
    createBody();
    createFooter();
    calculate();
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
    chargeNumbers.splice(colNum, 1);
    document.getElementById("table").innerHTML = "";
    createTable();
}

function addRow() {
    cacheState();
    document.getElementById("table").innerHTML = "";
    const rowData = {
        start: "",
        end: "",
        charge: -1
    }
    rows.push(rowData);
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
        const charge = getChargeNum(row);
        rowsTemp.push({ start, end, charge });
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

function createTimeField(fieldStr, index, value) {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = "time"
    input.value = value;
    input.id = fieldStr + index;
    td.append(input);

    return td;
}

function hoursDifference(start, end) {
    const timeStart = new Date("01/01/1970 " + start);
    const timeEnd = new Date("01/01/1970 " + end);
    const difference = timeEnd - timeStart;
    return difference/3600000;
}

function getChargeNum(row) {
    for (let index=0; index < chargeNumbers.length; index++) {
        const id = "charge" + row + "," + index;
        //console.log(id);
        const radioButton = document.getElementById(id);
        if (radioButton.checked) {
            return index;
        }
    }
    return -1;
}

function calculate() {
    let totalHours = 0;
    const chargeNumHours = []; 
    for (let index=0; index<chargeNumbers.length; index++)
        chargeNumHours.push(0);
    for (let row=0; row<rows.length; row++) {
        const start = document.getElementById("start" + row).value;
        const end = document.getElementById("end" + row).value;
        const total = hoursDifference(start, end);
        totalHours += total;

        const hoursTd = document.getElementById("hours"+row);
        hoursTd.textContent = round2Decimals(total);

        const checked = getChargeNum(row);
        if (checked != -1)
            chargeNumHours[checked] += total;
    }
    
    for (let index=0; index<chargeNumbers.length; index++) {
        const hoursTd = document.getElementById("chargeNumTotal" + index);
        hoursTd.textContent = round2Decimals(chargeNumHours[index]);
    }

    const totalHoursElem = document.getElementById("totalHours");
    totalHoursElem.textContent = round2Decimals(totalHours);
}

createTable();