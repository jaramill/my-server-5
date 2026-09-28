

// Fetch and display uploads

// 1. Runs as soon as the HTML is ready (Recommended for most tasks)
document.addEventListener("DOMContentLoaded", async () => {
    //console.log("DOM fully parsed and ready!");
    const uploads = await fetchUploads();
    const uploadsTable = document.getElementById('uploadsTable');
    const uploadsTableBody = uploadsTable.getElementsByTagName("tbody")[0];
    let tableHTML = '';
    uploads.forEach(upload => {
        tableHTML += makeUploadHtml(upload);
    });
    uploadsTableBody.innerHTML = tableHTML;
    
    document.getElementById("upload-table-count").innerText = `Showing ${uploadsTableBody.rows.length} of ${uploadsTableBody.rows.length} uploads`
 
});

// Add your custom JavaScript logic when clicked
document.getElementById('uploads-nav-button').addEventListener('click', async function () {

    const uploads = await fetchUploads();
    const uploadsTable = document.getElementById('uploadsTable');
    const uploadsTableBody = uploadsTable.getElementsByTagName("tbody")[0];
    let tableHTML = '';
    uploads.forEach(upload => {
        tableHTML += makeUploadHtml(upload);
    });
    uploadsTableBody.innerHTML = tableHTML;
    
    document.getElementById("upload-table-count").innerText = `Showing ${uploadsTableBody.rows.length} of ${uploadsTableBody.rows.length} uploads`

});
async function fetchUploads() {
     try {
        console.log(`/api/csvs`);
        const response = await fetch(`/api/csvs`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const uploads = await response.json();

        return uploads;
         } catch (error) {
        console.error('Error fetching uploads:', error);
    };
}

function makeUploadHtml (upload){
    const uploadHtml = `
        <tr data-id="${upload.id}">
            <td class="ps-4">
                <div data-field="csv_name">${upload.csv_name}
                </div>
            </td>
            <td>
                <div data-field="csv_month">${upload.csv_month}
                </div>
            </td>
            <td>
                <div data-field="date_modified">${upload.date_modified}
                </div>
            </td>
            <td class="text-end text-nowrap pe-4">
                <button class="btn btn-outline-info btn-sm" onclick="viewUpload(${upload.id})">View</button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteCsvAndOccupancy(${upload.id})">Delete
                    <span id="upload${upload.id}DeleteBtnSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                </button>
            </td>
        </tr>
        `;
    return uploadHtml;
};
async function viewUpload(id) {

    try {
        const response = await fetch(`/api/csvs/${id}`);

        if (!response.ok) {
            throw new Error('Fetch failed')
        };
        const data = await response.json();

        if (data) {
            for (const element of uploadButtons) {
                element.classList.add('d-none');
            };
            hiddenDiv.classList.remove('d-none'); // Show the div
            
            let csvObject = {'csvName': null, 'csvString': null};

            csvObject.csvString = data.csv_data;
            document.getElementById("csv-contents").innerHTML = csvToHtmlTable(csvObject);

            //let roomOccupancyByDate = {};

            let result = null;
            let parsedObject = {};
            [result, parsedObject] = parseCsv(csvObject);
           
            document.getElementById("parsed-csv-contents").innerHTML = parsedObjectToHtmlTable(parsedObject);
            const occupancyStateByCbrId = await getOccupancyStateByCbrId();
            document.getElementById("occupancy-data-contents").innerHTML = parsedObjectToHtmlTable(parsedObject, occupancyStateByCbrId);
            document.getElementById("csv-legend-contents").innerHTML = extractLegend(csvObject);
             

        };
    } catch (error) {
        console.error('Error:', error);
    };
};

async function deleteCsvAndOccupancy(id) {

    const spinner = document.getElementById(`upload${id}DeleteBtnSpinner`);

    const confirmed = await showConfirmModal("Are you sure you want to delete this record?");
    
    //if (confirm("Are you sure you want to delete this csv and its data from the occupancy table?")) {
        // Action to take if user clicked OK
    if (confirmed) {
        try {
            spinner.classList.remove("d-none");
            const response = await fetch(`/api/csvs/month/${id}`);
            if (!response.ok) {
                throw new Error('Delete failed')
            };
            const data = await response.json();

            const deleteData = await deleteOccupancy(data.csv_month);

            const deleteResponse = await fetch(`/api/csvs/update/${id}`, { method: 'DELETE' });

            if (!deleteResponse.ok) {
                throw new Error('Delete failed')
            } else {
                const data = await deleteResponse.json();
                const uploadsTable = document.getElementById('uploadsTable');
                const uploadsTableBody = uploadsTable.getElementsByTagName("tbody")[0];
                uploadsTable.querySelector(`[data-id="${id}"]`).remove();
                document.getElementById("upload-table-count").innerText = `Showing ${uploadsTableBody.rows.length} of ${uploadsTableBody.rows.length} uploads`
                
            };
        } catch (error) {
            console.error('Error:', error);
        } finally {
                spinner.classList.add("d-none");

        };
        
    } else {
        // Action to take if user clicked Cancel
        console.log("Action canceled.");
    };
}

document.getElementById("file-input").addEventListener("change", handleFileSelection);
const hiddenDiv = document.getElementById('hidden-div');

const uploadButtons = document.getElementsByClassName("upload-csv-button");



async function handleFileSelection(event) {

    let roomOccupancyByDate = {};

    let csvObject = {'csvName': null, csvString: null};

    const file = event.target.files[0];

    // Validate file existence and type
    if (!file) {
        const alertElement = document.getElementById("alert-element");
        alertElement.classList.remove('d-none');
        document.getElementById("alert-text").innerText = `No file selected. Please choose a file`;
        
        return;
    }

    if (!file.type.startsWith("text")) {
        const alertElement = document.getElementById("alert-element");
        alertElement.classList.remove('d-none');
        document.getElementById("alert-text").innerText = `Unsupported file type. Please select a text file`;
        
        return;
    }
    const extension = file.name.split('.').pop().toLowerCase();

    //const allowedExtensions = [''];

    if (extension !== 'csv') {
        const alertElement = document.getElementById("alert-element");
        alertElement.classList.remove('d-none');
        document.getElementById("alert-text").innerText = `File extension must be csv`;
        
        return;
    } else {
        csvObject.csvName = file.name;
    }

    // Read the file


    const reader = new FileReader();

    reader.onload = async () => {
        csvObject.csvString = reader.result;

        if (csvObject.csvString) {
            hiddenDiv.classList.remove('d-none'); // Show the div
            document.getElementById("csv-contents").innerHTML = csvToHtmlTable(csvObject);
            let result = null;
            let parsedObject = {};
            [result, parsedObject] = parseCsv(csvObject);
            if (result!=="success"){
                const alertElement = document.getElementById("alert-element");
                alertElement.classList.remove('d-none');
                document.getElementById("alert-text").innerText = `${result}`;
        
            } else{
                document.getElementById("parsed-csv-contents").innerHTML = parsedObjectToHtmlTable(parsedObject);
                const occupancyStateByCbrId = await getOccupancyStateByCbrId();
                document.getElementById("occupancy-data-contents").innerHTML = parsedObjectToHtmlTable(parsedObject, occupancyStateByCbrId);
                roomOccupancyByDate = parsedObjectToOccupancyByDate(parsedObject, occupancyStateByCbrId);
                document.getElementById("csv-legend-contents").innerHTML = extractLegend(csvObject);
                
                for (const element of uploadButtons) {
                element.addEventListener("click", (event) => uploadCsvAndOccupancyCheckMonthFirst(event, csvObject, parsedObject, roomOccupancyByDate), { once: true });
            }
            }

           

        } else {
            hiddenDiv.classList.add('d-none');    // Hide it again
        };


    };
    reader.onerror = () => {
        alert("Error reading the file. Please try again.", "error");
    };
    reader.readAsText(file);

}

const previewButtons = document.getElementsByClassName("preview-button");

for (const element of previewButtons) {
    element.addEventListener("click", hidePreview);
}

function hidePreview() {
    hiddenDiv.classList.add('d-none');
    for (const element of uploadButtons) {
        element.classList.remove('d-none');
    }
}

async function uploadCsvAndOccupancyCheckMonthFirst(event, csvObject, parsedObject, roomOccupancyByDate) {

    const spinner = document.getElementById('uploadBtnSpinner');
    const data = await checkIfMonthExists(parsedObject.csvMonth);
   
    if (data.exists){
        //let result = confirm("Are you sure you want to replace this csv?");
        const confirmed = await showConfirmModal("A csv for this month has already been uploaded, do you want to replace this csv and its occupancy data?");
        if (confirmed){
                
            const csvData = await uploadCsvandOccupancy(csvObject.csvName, parsedObject.csvMonth, csvObject.csvString, roomOccupancyByDate);
        
            const alertElement = document.getElementById("alert-element");
            alertElement.classList.remove('d-none');
            document.getElementById("alert-text").innerText = `Replaced existing occupancy data for the month of ${parsedObject.csvMonth}`;
            const uploadsTable = document.getElementById('uploadsTable')
            const uploadsTableBody = uploadsTable.getElementsByTagName("tbody")[0];
            uploadsTable.querySelector(`[data-id="${data.data.id}"]`).remove();
            uploadsTableBody.innerHTML += makeUploadHtml(csvData);
        
            document.getElementById("upload-table-count").innerText = `Showing ${uploadsTableBody.rows.length} of ${uploadsTableBody.rows.length} uploads`
          
        }
    } else {
        const csvData = await uploadCsvandOccupancy(csvObject.csvName, parsedObject.csvMonth, csvObject.csvString, roomOccupancyByDate);
        const uploadsTable = document.getElementById('uploadsTable')
        const uploadsTableBody = uploadsTable.getElementsByTagName("tbody")[0];
        uploadsTableBody.innerHTML += makeUploadHtml(csvData);
    
        document.getElementById("upload-table-count").innerText = `Showing ${uploadsTableBody.rows.length} of ${uploadsTableBody.rows.length} uploads`
          
    }
    spinner.classList.add("d-none");
    hiddenDiv.classList.add('d-none');

}

async function uploadCsvandOccupancy(csvName, csvMonth, csvString, roomOccupancyByDate) {
    try {
        const csvResponse = await fetch(`/api/csvs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'text/plain'
            },
        
            body: JSON.stringify({csvName, csvMonth, csvString})
        });

        const csvData = await csvResponse.json();

        const occupancyResponse = await fetch(`/api/occupancy/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'text/plain'
            },
        
            body: JSON.stringify({roomOccupancyByDate})
        });
        //console.log(roomOccupancyByDate);
        const occupancyData = await occupancyResponse.json();
   
        return csvData;     

        
    } catch (error) {
        console.error('Network Error:', error);
    }
}
// async function uploadOccupancy(roomOccupancyByDate) {
   
//     try {
//         const response = await fetch(`/api/occupancy/batch`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//                 // 'Content-Type': 'text/plain'
//             },
//             body: JSON.stringify({roomOccupancyByDate})
//         });

//         if (!response.ok) {
//             const errData = await response.json();
//             alert(`Error: ${errData.error}`);
//         } else{
//             return response;
//         }
//         // const message = await response.text();
//     } catch (error) {
//         console.error('Network Error:', error);
//     }
// }

async function deleteOccupancy(csvMonth) {
    try {

        const deleteResponse = await fetch(`/api/occupancy/batch/${csvMonth}`, { method: 'DELETE' });
        if (deleteResponse.ok) {


        } else {
            const errData = await response.json();
            alert(`Error: ${errData.error}`);
        }
        // const message = await response.text();
    } catch (error) {
        console.error('Network Error:', error);
    }
}
function csvToHtmlTable(csvObject) {
    //const csvStringWithoutDuplicateLines = removeDuplicateLines(csvString)

    // 1. Extract and save the text inside the double quotes (the legend)
    //const regex = /"([^"]*)"/g;
    //const savedText = [...csvString.matchAll(regex)].map(match => match[1]);

    // 2. Remove the double quotes and the text inside them from the string
    //const cleanedString = csvString.replace(regex, '');

    //const rows = csvString.trim().split("\n");
    const rows = csvObject.csvString.trim().split("\n");
    //const rows = cleanedString.trim().split("\n");
    let html = `<div class="table-responsive">\n`;
    html += `<table class="table table-bordered">\n`;

    rows.forEach((row, index) => {
        // replace repeating commas with one comma and replace single comma at the start and end of row (this removes empty cells on that row)
        //const cleanRow = row.replace(/,+/g, ',').trim().replace(/(^,)|(,$)/g, "");
        const columns = row.split(",");

        html += `<tr>\n`;

        columns.forEach(cell => {
            // Use <th> for the first header row, <td> for everything else
            //const tag = (index === 0) ? "th" : "td";
            //html += `    <${tag}>${cell.trim()}</${tag}>\n`;
            html += `<td>${cell.trim()}</td>\n`;
        });

        html += `</tr>\n`;
    });
    html += `</table>\n`;
    html += `</div>\n`;
    // append first text extracted within the double quotes (the legend)
    //html += `<table border='1'><tr><td><pre>${savedText[0]}</pre></td></tr></table>`;
    return html;
}
function extractLegend(csvObject) {

    //const legendValues = [];
    const regex = /"([^"]*)"/g;

    // Extract matches using matchAll
    const matches = [...csvObject.csvString.matchAll(regex)];

    // Get the text inside the quotes (Capture Group 1)
    const results = matches.map(match => match[1]);
    //const match = csvString.match(/"([^"]*)"/);
    if (!results) {
        return "legend not found, legend must be enclosed by double quotes in csv";
    } else {
        const result = results.find(result => result.toLowerCase().includes("legend"));

        if (result) {
            const rows = result.trim().split("\n");
            let html = `<div class="table-responsive">\n`;
            html += `<table class="table table-bordered">\n`;
            html += `<thead><tr>\n`;
            html += `<th scope="col">cbr id</th>\n`;
            html += `<th scope="col">Description</th>\n`;
            // html += `<th scope="col" style="width: 1.5rem">Color</th>\n`; 
            html += `</tr></thead>\n`;

            rows.forEach((row, index) => {
                // replace repeating commas with one comma and replace single comma at the start and end of row (this removes empty cells on that row)
                //const cleanRow = row.replace(/,+/g, ',').trim().replace(/(^,)|(,$)/g, "");
                if (row && !row.toLowerCase().includes("legend")) {

                    const columns = row.split(":");
                    if (columns.length == 2) {
                        let value = "";
                        html += `<tr>\n`;
                        columns.forEach((cell, index) => {
                            // Use <th> for the first header row, <td> for everything else
                            //const tag = (index === 0) ? "th" : "td";
                            //html += `    <${tag}>${cell.trim()}</${tag}>\n`;

                            if (index == 0) {
                                value = cell.trim();
                                html += `<td class="${value}">${value}</td>\n`;
                                //legendValues.push(value);
                            } else {
                                html += `<td>${cell.trim()}</td>\n`;
                            }
                        });
                        // html += `<td><input type="color" class="form-control form-control-color legend-color-picker" data-id= ${value} value="#ffff"></td>\n`;
                        html += `</tr>\n`;
                    }
                }
            });
            html += `</table>\n`;
            html += `</div>\n`;
            return html;
        } else return `string(s) enclosed in double quotes do not include "legend"\n`;
        // append first text extracted within the double quotes (the legend)
        //html += `<table border='1'><tr><td><pre>${savedText[0]}</pre></td></tr></table>`;              
    }
}

function parseCsv(csvObject) {

    let result = null;
    let parsedObject = {'csvMonth': null, csvHeader: {}, csvRows: {}};

    const rows = csvObject.csvString.trim().split("\n");
    //const rows = cleanedString.trim().split("\n");
    //let message = "";
    let otherRows = [];
    let dataRows = [];
    let headerRows = [];
    //let dateRows = [];
    rows.forEach((row, index) => {

        if (row.toLowerCase().startsWith("room")) {
            dataRows.push(row)
        } else if (row.includes("1,2,3")) {
            headerRows.push(row)
            // } else if (cleanRow.includes("Date")) {
            //   dateRows.push(cleanRow)
        } else if (row) {
            otherRows.push(row)
        }
    });
    const headers = headerRows[0].split(',').map(header => header.trim());

    // Get eg Jun and 26 from Jun-26

    const monthYear = headers[0].replace(/[\s/_,]+/g, '-');
    const parts = monthYear.split('-').map(part => part.trim());
    const firstPart = convertMonthToNumber(parts[0]);
    const secondPart = convertMonthToNumber(parts[1]);
    let month = "";
    let year = "";
    if (firstPart !== null && secondPart === null) {
        month = firstPart;
        year = convertYearTo4digits(parts[1]);
    } else if (firstPart === null && secondPart !== null) {
        month = secondPart;
        year = convertYearTo4digits(parts[1]);
    } else if (firstPart !== null && !secondPart !== null) {
        result =  `ambiguous date format in first cell of date row: ${monthYearString}`;
        return [result, null];
    } else {
        result = `unrecognized date format in first cell of date row: ${monthYearString}`;
        return [result, null];
    }

    parsedObject.csvMonth = `${month}-${year}`;

    const headersSliced = headers.slice(1);

    headersSliced.forEach((header, index) => {
        if (header) {
            const value = dateToDateString(new Date(year, month - 1, parseInt(header)));

            parsedObject.csvHeader[index] = value;
        }
    });


    //dataRows.slice(1).forEach((row,row_index) => {
    dataRows.forEach((row) => {
        const cells = row.split(',').map(value => value.trim());
        const roomId = cells[0].replaceAll(" ", "_").trim();;

        cells.forEach((cell, index) => {
            
            if (index == 0) {
                parsedObject.csvRows[roomId] = {};
        
            } else if (cell) {
                parsedObject.csvRows[roomId][index - 1] = cell.trim();
            }
        });

    });

    result = "success";
    return [result, parsedObject];
}
// see common.js
// function dateToDateString(date) {
//     return date.toLocaleDateString('en-US', {
//         //weekday: 'short', 
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//     });
// }
function convertMonthToNumber(monthName) {
    // Append a temporary day and year so JavaScript can parse it
    const date = new Date(`${monthName} 1, 2000`);
    const monthIndex = date.getMonth();

    // getMonth() returns 7 for August, so add 1 to get 8
    // Return null if the input string is invalid (NaN)
    return isNaN(monthIndex) ? null : monthIndex + 1;
}
function convertYearTo4digits(year) {
    const yearInt = parseInt(year);
    return yearInt < 100 ? yearInt + 2000 : yearInt
}
async function getOccupancyStateByCbrId() {
    try {
        const response = await fetch(`/api/occupancy-states-by-cbr-id`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const occupancyStates = await response.json();

        const occupancyByCsvId = {}
        occupancyStates.forEach(state => {
            occupancyByCsvId[state.cbr_id] = {"id":state.id,"state": state.state};
        });
        return occupancyByCsvId;
    } catch (error) {
        console.error('Error fetching occupancy states:', error);
    }
}
async function checkIfMonthExists(csvMonth) {
    //console.log(occupancyData)
    try {
        
        const response = await fetch(`/api/csvs/check/${csvMonth}`);

        if (!response.ok) {
            throw new Error('Check failed')
        }
        const data = await response.json();

        // will be null if csv for this month not in database
        return data;
     
    } catch (error) {
        console.error('Network Error:', error);
    }
}


function parsedObjectToHtmlTable(parsedObject, occupancyStateByCbrId) {

    let html = ``;
    html = `<div class="table-responsive table-freeze-container">\n`;
    html += `<table class="table table-sm table-bordered">\n`;
    html += `<thead><tr>`;
    html += `<th class="freeze-col freeze-row-th"></th>\n`;

    Object.values(parsedObject.csvHeader).forEach(value => {
        html += `<th>${value}</th>\n`;
    });

    html += `</tr></thead>\n`;
    if (occupancyStateByCbrId){
        for (const [key, row] of Object.entries(parsedObject.csvRows)) {
            // console.log(`${key}: ${value}`);
            html += `<tr><td class="text-nowrap freeze-col">${key}</td>\n`;
            Object.values(row).forEach(value => {

                html += `<td>${occupancyStateByCbrId[value].state}</td>\n`;

            });
            html += `</tr>\n`;
        };
    } else {
         for (const [key, row] of Object.entries(parsedObject.csvRows)) {
            // console.log(`${key}: ${value}`);
            html += `<tr><td class="text-nowrap freeze-col">${key}</td>\n`;
            Object.values(row).forEach(value => {

                html += `<td>${value}</td>\n`;

            });
        html += `</tr>\n`;
        };
    }
    

    html += `</table>\n`;
    html += `</div>\n`;
    return html;
};

function parsedObjectToOccupancyByDate(parsedObject, occupancyStateByCbrId) {

    const occupancyByDate = {}

    for (const [key, value] of Object.entries(parsedObject.csvHeader)) {
        occupancyByDate[value] = {};
        for (const [roomId, row] of Object.entries(parsedObject.csvRows)) {
            occupancyByDate[value][roomId]= occupancyStateByCbrId[row[key]].id;
        };
    };

    return occupancyByDate;
};