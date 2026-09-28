

// Initialize popovers globally using event delegation
const globalPopover = new bootstrap.Popover(document.body, {
    selector: '[data-bs-toggle="popover"]',
    // Add other options here if needed, like template or placement
});

// Fetch and display occupancy and cleaning states

// Add your custom JavaScript logic when clicked
document.getElementById('states-nav-button').addEventListener('click', async function () {

    const occupancyStates = await fetchOccupancyStates();// Your custom code here (e.g., fetch data, log events)
    const cleaningStates = await fetchCleaningStates();

    const occupancyTable = document.getElementById('occupancyTable');
    const occupancyTableBody = occupancyTable.getElementsByTagName("tbody")[0];
    let tableHtml = '';
    occupancyStates.forEach(state => {
    
        tableHtml += makeOccupancyHtml(state);
        
    });
    occupancyTableBody.innerHTML = tableHtml;
    document.getElementById("occupancy-table-count").innerText = `Showing ${occupancyStates.length} of ${occupancyStates.length} states`
 
    const cleaningTable = document.getElementById('cleaningTable');
    const cleaningTableBody = cleaningTable.getElementsByTagName("tbody")[0];

    tableHtml = '';
        cleaningStates.forEach(state => {

            tableHtml += makeCleaningHtml(state);
        });
        cleaningTableBody.innerHTML = tableHtml;
        document.getElementById("cleaning-table-count").innerText = `Showing ${cleaningStates.length} of ${cleaningStates.length} states`
});

// Get occupancy states

// see common.js
// async function fetchOccupancyStates() {
    
//     try {
//         const response = await fetch(`/api/occupancy-states`);
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const occupancyStates = await response.json();

//         return occupancyStates;
//         } catch (error) {
//         console.error('Error fetching occupancy states:', error);
//     }
// };

function makeOccupancyHtml(state){
    let borderChecked = "";

    let previewStyle = `background-color:${state.background_color};`;


    if (state.border === "true") {
        borderChecked = "checked";
        previewStyle += `border: 5px solid ${state.border_color};`;
    }

    let stripesChecked = "";

    if (state.stripes === "true") {
        stripesChecked = "checked";
        previewStyle += `
                background: repeating-linear-gradient(
                -45deg,
                ${state.background_color},
                ${state.background_color} 10px,
                ${state.stripes_color} 10px,
                ${state.stripes_color} 20px
            );`;
    }

    let deleteButtonHtml = "";
    if (state.deletable === "true") {
        deleteButtonHtml = `<button class="btn my-2 btn-outline-danger btn-sm" onclick="deleteOccupancyState(${state.id})">
                                <span id="occupancy${state.id}DeleteBtnSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                                    Delete
                            </button>`;
    }
    let occupancyHtml = `
        <tr data-id="${state.id}">
            <td class ="p-0">
                <div class="row m-0">
                    <div class="col border col-lg-3">
                        state:<span class="text-primary">**&nbsp
                        </span> 
                    </div>
                    <div class="col border">
                        <span class="editable" data-field="state">${state.state}
                        </span>
                    </div>
                    <div class="w-100"></div>
                    <div class="col border col-lg-3">
                        cbr_id:<span class="text-danger">*&nbsp
                        </span>
                    </div>
                    <div class="col border">
                        <span class="editable" data-field="cbr_id">${state.cbr_id}
                        </span>
                    </div>
                    <div class="w-100"></div>
                    <div class="col border col-lg-3">
                        abbreviation:
                    </div>
                    <div class="col border">
                        <span class="editable" data-field="abbreviation">${state.abbreviation}
                        </span>
                    </div>
                    <div class="w-100"></div>
                    <div class="col border col-lg-3">
                        priority:
                    </div>
                    <div class="col border">
                        <span class="editable-number" data-field="priority">${state.priority}
                        </span>
                    </div>
                    <div class="w-100"></div>
                    <div class="col border col-lg-3">
                        description:
                    </div>
                    <div class="col border">
                        <span class="editable" data-field="description">${state.description}
                        </span>
                    </div>
                    <div class="w-100"></div>
                    <div class="col border col-lg-3">
                        background color
                    </div>
                    <div class="col border d-table-cell">    
                        <span class="editable-color" data-field="background_color">${state.background_color}
                        </span>
                    </div>
                    <div class="w-100"></div>
                    <div class="col border col-lg-3">
                        <span class="me-2 form-check form-check-inline editable-checkbox" data-field="border">
                            <input class="form-check-input" type="checkbox" value="" ${borderChecked} disabled>
                            <label class="form-check-label" >add border</label>
                        </span>
                    </div>
                    <div class="col border d-table-cell">    
                        <span class="editable-color" data-field="border_color">${state.border_color}
                        </span>
                    </div>
                    <div class="w-100"></div>
                    <div class="col border col-lg-3">
                        <span class="me-2 form-check form-check-inline editable-checkbox" data-field="stripes">
                            <input class="form-check-input" type="checkbox" value="" ${stripesChecked} disabled>
                            <label class="form-check-label" >add diagonal stripes</label>
                        </span>
                    </div>
                    <div class="col border d-table-cell">    
                        <span class="editable-color" data-field="stripes_color">${state.stripes_color}
                        </span>    
                    
                    </div>
                </div>  
            </td>
            <td class="text-center">${state.state}
                <div class="d-flex justify-content-center w-auto">
                    <div class="border border-dark p-0" style="height: 55px; width: 55px;">
                        <div class="w-100 h-100" style="${previewStyle}">     
                        </div>
                    </div>
                </div>

                <button class="btn btn-sm my-2 btn-outline-secondary edit-btn">Edit</button>
                <button class="btn btn-sm my-2 btn-success save-btn d-none">
                    <span id="occupancy${state.id}SaveBtnSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                    Save
                </button>
                <button class="btn btn-sm my-2 btn-secondary cancel-btn d-none">Cancel</button>
                ${deleteButtonHtml}
            </td>
        </tr>
        `;
    return occupancyHtml;
}

// Add occupacy state

// Handle form submission
occupancyForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cbr_id = document.getElementById('occupancy-cbr-id').value;
    const state = document.getElementById('occupancy-state').value;
    const abbreviation = document.getElementById('occupancy-abbreviation').value;
    const priority = document.getElementById('occupancy-priority').value;
    const description = document.getElementById('occupancy-description').value;
    const background_color = document.getElementById('occupancy-background-color').value;
    const border = String(document.getElementById('occupancy-border').checked);
    const border_color = document.getElementById('occupancy-border-color').value;
    const stripes = String(document.getElementById('occupancy-stripes').checked);
    const stripes_color = document.getElementById('occupancy-stripes-color').value;
    const deletable = "true";

    const spinner = document.getElementById(`occupancyFormBtnSpinner`);

    try {
        spinner.classList.remove("d-none");
        
        const response = await fetch(`/api/occupancy-states`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cbr_id, state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color, deletable })
        });

        if (response.ok) {
            occupancyForm.reset();
            fetchOccupancyStates(); // Refresh list
            const dataObject = await response.json();
            const occupancyTable = document.getElementById('occupancyTable');
            const occupancyTableBody = occupancyTable.getElementsByTagName("tbody")[0];
            occupancyTableBody.innerHTML += makeOccupancyHtml(dataObject);

            const formElement = document.getElementById('collapseFormOccupancy');
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(formElement);
            bsCollapse.hide();
        } else {
            const errData = await response.json();
            alert(`Error: ${errData.error}`);
        }
    } catch (error) {
        console.error('Error adding occupancy state:', error);
    } finally{
        spinner.classList.add("d-none");
    }
});

// Delete occupancy state

async function deleteOccupancyState(id) {
    const spinner = document.getElementById(`occupancy${id}DeleteBtnSpinner`);

    const confirmed = await showConfirmModal("Are you sure you want to delete this record?");

    //if (confirm("Are you sure you want to delete this occupancy state?")) {
    if (confirmed) {
        // Action to take if user clicked OK
        try {
            spinner.classList.remove("d-none");

            const deleteResponse = await fetch(`/api/occupancy-states/update/${id}`, { method: 'DELETE' });

            if (!deleteResponse.ok) {
                throw new Error('Delete failed')
            } else {
                console.log("Occupancy state deleted.");
                // fetchOccupancyStates();
                const data = await deleteResponse.json();
                const occupancyTable = document.getElementById('occupancyTable');
                const occupancyTableBody = occupancyTable.getElementsByTagName("tbody")[0];
                occupancyTable.querySelector(`[data-id="${id}"]`).remove();
                document.getElementById("upload-table-count").innerText = `Showing ${occupancyTableBody.rows.length} of ${occupancyTableBody.rows.length} occupancy states`
                
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            spinner.classList.add("d-none");
        }
        
    } else {
        // Action to take if user clicked Cancel
        console.log("Action canceled.");
    }

};

// Edit occupancy state

document.getElementById('occupancyTable').addEventListener('click', function (e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;

    const rowId = row.getAttribute('data-id');
    const editCells = row.querySelectorAll('.editable');
    const editColorCells = row.querySelectorAll('.editable-color');
    const editCheckboxCells = row.querySelectorAll('.editable-checkbox');
    const editPriority = row.querySelector('.editable-number');

    const editBtn = row.querySelector('.edit-btn');
    const saveBtn = row.querySelector('.save-btn');
    const cancelBtn = row.querySelector('.cancel-btn');

    // --- 1. CLICK EDIT BUTTON ---
    if (target.classList.contains('edit-btn')) {
        editCells.forEach(cell => {
            // Save original text in a data attribute to support cancellation
            cell.dataset.originalValue = cell.innerText.trim();

            // Swap plain text out for a Bootstrap form control input
            const currentText = cell.innerText;
            cell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${currentText}">`;
        });
        editColorCells.forEach(cell => {
            // Save original text in a data attribute to support cancellation
            cell.dataset.originalValue = cell.innerText.trim();

            // Swap plain text out for a Bootstrap form control input
            const currentText = cell.innerText;
            cell.innerHTML = `<input type="color" class="form-control form-control-color" value="${currentText}">`;
        });
        editCheckboxCells.forEach(cell => {
            // Save original text in a data attribute to support cancellation
            cell.querySelector('input').disabled = false;
            cell.dataset.originalValue = cell.checked;
        });

        editPriority.dataset.originalValue = editPriority.innerText.trim();
        // Swap plain text out for a Bootstrap form control input
        const currentText = editPriority.innerText;
        editPriority.innerHTML = `<input type="number" min="1" max="10" class="form-control form-control-sm" value="${currentText}">`;
      

        // Toggle UI visibility using Bootstrap utility classes
        editBtn.classList.add('d-none');
        saveBtn.classList.remove('d-none');
        cancelBtn.classList.remove('d-none');
    }

    // --- 3. CLICK SAVE BUTTON (FETCH API) ---
    if (target.classList.contains('save-btn')) {
        const spinner = document.getElementById(`occupancy${rowId}SaveBtnSpinner`);

        //const updatedData = { id: rowId };
        const updatedData = {};
        // Collect newly updated values from inputs
        editCells.forEach(cell => {
            const input = cell.querySelector('input');
            const fieldName = cell.getAttribute('data-field');
            updatedData[fieldName] = input.value.trim();
        });
        editColorCells.forEach(cell => {
            const input = cell.querySelector('input');
            const fieldName = cell.getAttribute('data-field');
            updatedData[fieldName] = input.value.trim();
        });
        editCheckboxCells.forEach(cell => {
            const input = cell.querySelector('input').checked;
            const fieldName = cell.getAttribute('data-field');
            updatedData[fieldName] = input.toString();
        });
       const input = editPriority.querySelector('input');
        const fieldName = editPriority.getAttribute('data-field');
        updatedData[fieldName] = input.valueAsNumber;
        

        //     updatedData[editBorderCell.getAttribute('data-field')] = editBorderCell.querySelector('input').checked;
        //     updatedData[editStripesCell.getAttribute('data-field')] = editStripesCell.querySelector('input').checked;
        //    // Disable Save button during API interaction to prevent double submissions
        saveBtn.disabled = true;
        //saveBtn.innerText = "Saving...";
        spinner.classList.remove("d-none");


        // Send payload via JSON to backend API using native JavaScript fetch
        fetch(`/api/occupancy-states/update/${rowId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Network update failed');
                return response.json();
            })
            .then(data => {
                // Update UI cell layout with the raw verified values
                //fetchOccupancyStates();
                // Toggle back button display state

                row.innerHTML = makeOccupancyHtml(data);   
                editBtn.classList.remove('d-none');
                saveBtn.classList.add('d-none');
                cancelBtn.classList.add('d-none');
            })
            .catch(error => {
                alert('Failed to save data. Please check your connection.');
                console.error('Fetch Error:', error);
            })
            .finally(() => {
                // Reset save button layout properties
                saveBtn.disabled = false;
                //saveBtn.innerText = "Save";
                 spinner.classList.add("d-none");

            });
        
    }
    // --- 2. CLICK CANCEL BUTTON ---
    if (target.classList.contains('cancel-btn')) {
        editCells.forEach(cell => {
            // Revert back to original saved text value
            cell.innerText = cell.dataset.originalValue;
        });
        editColorCells.forEach(cell => {
            // Revert back to original saved text value
            cell.innerText = cell.dataset.originalValue;
        });
        editCheckboxCells.forEach(cell => {
            // Revert back to original saved text value
            cell.querySelector('input').checked = cell.dataset.originalValue;
            cell.querySelector('input').disabled = true;
        });

        editPriority.innerText = editPriority.dataset.originalValue;

        // Reset visible action buttons
        editBtn.classList.remove('d-none');
        saveBtn.classList.add('d-none');
        cancelBtn.classList.add('d-none');
    }
});

// Get cleaning states

// see common.js
// async function fetchCleaningStates() {
    
//     try {
//         const response = await fetch(`/api/cleaning-states`);
//         if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const cleaningStates = await response.json();

//         return cleaningStates;

//         } catch (error) {
//         console.error('Error fetching cleaning states:', error);
//     }
// };

function makeCleaningHtml(state){
    let borderChecked = "";

        let previewStyle = `background-color:${state.background_color};`;


        if (state.border === "true") {
            borderChecked = "checked";
            previewStyle += `border: 5px solid ${state.border_color};`;
        }

        let stripesChecked = "";

        if (state.stripes === "true") {
            stripesChecked = "checked";
            previewStyle += `
                    background: repeating-linear-gradient(
                    45deg,
                    ${state.background_color},
                    ${state.background_color} 10px,
                    ${state.stripes_color} 10px,
                    ${state.stripes_color} 20px
                );`;
        }

        let cleaningHtml = `
            <tr data-id="${state.id}">
                <td class ="p-0">
                    <div class="row m-0">
                        <div class="col border col-lg-3">
                            state:<span class="text-primary">**&nbsp
                            </span> 
                        </div>
                        <div class="col border">
                            <span class="editable" data-field="state">${state.state}
                            </span>
                        </div>
                        <div class="w-100"></div>
                        <div class="col border col-lg-3">
                            abbreviation:
                        </div>
                        <div class="col border">
                            <span class="editable" data-field="abbreviation">${state.abbreviation}
                            </span>
                        </div>
                        <div class="w-100"></div>   
                        <div class="col border col-lg-3">
                            priority:
                        </div>
                        <div class="col border">
                            <span class="editable-number" data-field="priority">${state.priority}
                            </span>
                        </div>
                        <div class="w-100"></div>
                        <div class="col border col-lg-3">
                            description:
                        </div>
                        <div class="col border">
                            <span class="editable" data-field="description">${state.description}
                            </span>
                        </div>
                        <div class="w-100"></div>
                        <div class="col border col-lg-3">
                            background color
                        </div>
                        <div class="col border d-table-cell">    
                            <span class="editable-color" data-field="background_color">${state.background_color}
                            </span>
                        </div>
                        <div class="w-100"></div>
                        <div class="col border col-lg-3">
                            <span class="me-2 form-check form-check-inline editable-checkbox" data-field="border">
                                <input class="form-check-input" type="checkbox" value="" ${borderChecked} disabled>
                                <label class="form-check-label" >add border</label>
                            </span>
                        </div>
                        <div class="col border d-table-cell">    
                            <span class="editable-color" data-field="border_color">${state.border_color}
                            </span>
                        </div>
                        <div class="w-100"></div>
                        <div class="col border col-lg-3">
                            <span class="me-2 form-check form-check-inline editable-checkbox" data-field="stripes">
                                <input class="form-check-input" type="checkbox" value="" ${stripesChecked} disabled>
                                <label class="form-check-label" >add diagonal stripes</label>
                            </span>
                        </div>
                        <div class="col border d-table-cell">    
                            <span class="editable-color" data-field="stripes_color">${state.stripes_color}
                            </span>    
                        
                        </div>
                    </div>  
                </td>
                <td class="text-center">${state.state}
                    <div class="d-flex justify-content-center w-auto">
                    <div class="border border-dark p-2" style="height: 55px; width: 55px;">
                        <div class="w-100 h-100" style="${previewStyle}">     
                        </div>
                    </div>
                </div>
                    <button class="btn btn-sm my-2 btn-outline-secondary edit-btn">Edit</button>
                    <button class="btn btn-sm my-2 btn-success save-btn d-none">Save
                        <span id="cleaning${state.id}SaveBtnSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>

                    </button>
                    <button class="btn btn-sm my-2 btn-secondary cancel-btn d-none">Cancel</button>
                    <button class="btn my-2 btn-outline-danger btn-sm" onclick="deleteCleaningState(${state.id})">
                        <span id="cleaning${state.id}DeleteBtnSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                        Delete
                    </button>
                </td>
            </tr>
            `;
    return cleaningHtml;
}
// Add cleaning state

// Handle form submission
cleaningForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const state = document.getElementById('cleaning-state').value;
    const abbreviation = document.getElementById('cleaning-abbreviation').value;
    const priority = document.getElementById('cleaning-priority').value;
    const description = document.getElementById('cleaning-description').value;
    const background_color = document.getElementById('cleaning-background-color').value;
    const border = String(document.getElementById('cleaning-border').checked);
    const border_color = document.getElementById('cleaning-border-color').value;
    const stripes = String(document.getElementById('cleaning-stripes').checked);
    const stripes_color = document.getElementById('cleaning-stripes-color').value;

    const spinner = document.getElementById(`cleaningFormBtnSpinner`);

    try {
        spinner.classList.remove("d-none");

        const response = await fetch(`/api/cleaning-states`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({state, abbreviation, priority, description, background_color, border, border_color, stripes, stripes_color})
        });

        if (response.ok) {
            cleaningForm.reset();
            //fetchCleaningStates(); // Refresh list
            const dataObject = await response.json();
            const cleaningTable = document.getElementById('cleaningTable');
            const cleaningTableBody = cleaningTable.getElementsByTagName("tbody")[0];
            cleaningTableBody.innerHTML += makeCleaningHtml(dataObject);

            const formElement = document.getElementById('collapseFormCleaning');
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(formElement);
            bsCollapse.hide();
        } else {
            const errData = await response.json();
            alert(`Error: ${errData.error}`);
        }
    } catch (error) {
        console.error('Error adding cleaning state:', error);
    } finally {
        spinner.classList.add("d-none");
    }
});

// Delete cleaning state

async function deleteCleaningState(id) {
    const spinner = document.getElementById(`cleaning${id}DeleteBtnSpinner`);

    const confirmed = await showConfirmModal("Are you sure you want to delete this record?");

    //if (confirm("Are you sure you want to delete this occupancy state?")) {
    if (confirmed) {
        // Action to take if user clicked OK
        try {
            spinner.classList.remove("d-none");

            const deleteResponse = await fetch(`/api/cleaning-states/update/${id}`, { method: 'DELETE' });

            if (!deleteResponse.ok) {
                throw new Error('Delete failed')
            } else {
                console.log("Cleaning state deleted.");
                //fetchCleaningStates();
                const data = await deleteResponse.json();
                const cleaningTable = document.getElementById('cleaningTable');
                const cleaningTableBody = cleaningTable.getElementsByTagName("tbody")[0];
                cleaningTable.querySelector(`[data-id="${id}"]`).remove();
                document.getElementById("upload-table-count").innerText = `Showing ${cleaningTableBody.rows.length} of ${cleaningTableBody.rows.length} cleaning states`
                

            }
           
        } catch (error) {
            console.error('Error:', error);
        } finally {
            spinner.classList.add("d-none");
        }
    } else {
        // Action to take if user clicked Cancel
        console.log("Action canceled.");
    }
};

// Edit cleaning state

document.getElementById('cleaningTable').addEventListener('click', function (e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;

    const rowId = row.getAttribute('data-id');
    const editCells = row.querySelectorAll('.editable');
    const editColorCells = row.querySelectorAll('.editable-color');
    const editCheckboxCells = row.querySelectorAll('.editable-checkbox');
    const editPriority = row.querySelector('.editable-number');

    const editBtn = row.querySelector('.edit-btn');
    const saveBtn = row.querySelector('.save-btn');
    const cancelBtn = row.querySelector('.cancel-btn');

    // --- 1. CLICK EDIT BUTTON ---
    if (target.classList.contains('edit-btn')) {
        editCells.forEach(cell => {
            // Save original text in a data attribute to support cancellation
            cell.dataset.originalValue = cell.innerText.trim();

            // Swap plain text out for a Bootstrap form control input
            const currentText = cell.innerText;
            cell.innerHTML = `<input type="text" class="form-control form-control-sm" value="${currentText}">`;
        });
        editColorCells.forEach(cell => {
            // Save original text in a data attribute to support cancellation
            cell.dataset.originalValue = cell.innerText.trim();

            // Swap plain text out for a Bootstrap form control input
            const currentText = cell.innerText;
            cell.innerHTML = `<input type="color" class="form-control form-control-color" value="${currentText}">`;
        });
        editCheckboxCells.forEach(cell => {
            // Save original text in a data attribute to support cancellation
            cell.querySelector('input').disabled = false;
            cell.dataset.originalValue = cell.checked;  
        });
        editPriority.dataset.originalValue = editPriority.innerText.trim();
        // Swap plain text out for a Bootstrap form control input
        const currentText = editPriority.innerText;
        editPriority.innerHTML = `<input type="number" min="1" max="10" class="form-control form-control-sm" value="${currentText}">`;
      

        // Toggle UI visibility using Bootstrap utility classes
        editBtn.classList.add('d-none');
        saveBtn.classList.remove('d-none');
        cancelBtn.classList.remove('d-none');
    }

    // --- 3. CLICK SAVE BUTTON (FETCH API) ---
    if (target.classList.contains('save-btn')) {

        const spinner = document.getElementById(`cleaning${rowId}SaveBtnSpinner`);

        //const updatedData = { id: rowId };
        const updatedData = {};
        // Collect newly updated values from inputs
        editCells.forEach(cell => {
            const input = cell.querySelector('input');
            const fieldName = cell.getAttribute('data-field');
            updatedData[fieldName] = input.value.trim();
        });
        editColorCells.forEach(cell => {
            const input = cell.querySelector('input');
            const fieldName = cell.getAttribute('data-field');
            updatedData[fieldName] = input.value.trim();
        });
        editCheckboxCells.forEach(cell => {
            const input = cell.querySelector('input').checked;
            const fieldName = cell.getAttribute('data-field');
            updatedData[fieldName] = input.toString();;
        });

        const input = editPriority.querySelector('input');
        const fieldName = editPriority.getAttribute('data-field');
        updatedData[fieldName] = input.valueAsNumber;

        //     updatedData[editBorderCell.getAttribute('data-field')] = editBorderCell.querySelector('input').checked;
        //     updatedData[editStripesCell.getAttribute('data-field')] = editStripesCell.querySelector('input').checked;
        //    // Disable Save button during API interaction to prevent double submissions
        
        
        saveBtn.disabled = true;
        //saveBtn.innerText = "Saving...";
         spinner.classList.remove("d-none");

        // Send payload via JSON to backend API using native JavaScript fetch
        fetch(`/api/cleaning-states/update/${rowId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
            .then(response => {
                if (!response.ok) throw new Error('Network update failed');
                return response.json();
            })
            .then(data => {
                // Update UI cell layout with the raw verified values
                row.innerHTML = makeCleaningHtml(data);   
                // Toggle back button display state
                editBtn.classList.remove('d-none');
                saveBtn.classList.add('d-none');
                cancelBtn.classList.add('d-none');
            })
            .catch(error => {
                alert('Failed to save data. Please check your connection.');
                console.error('Fetch Error:', error);
            })
            .finally(() => {
                // Reset save button layout properties
                saveBtn.disabled = false;
                //saveBtn.innerText = "Save";
                 spinner.classList.add("d-none");
            });
    }
    // --- 2. CLICK CANCEL BUTTON ---
    if (target.classList.contains('cancel-btn')) {
        editCells.forEach(cell => {
            // Revert back to original saved text value
            cell.innerText = cell.dataset.originalValue;
        });
        editColorCells.forEach(cell => {
            // Revert back to original saved text value
            cell.innerText = cell.dataset.originalValue;
        });
        editCheckboxCells.forEach(cell => {
            // Revert back to original saved text value
            cell.querySelector('input').checked = cell.dataset.originalValue;
            cell.querySelector('input').disabled = true;
        });

        editPriority.innerText = editPriority.dataset.originalValue;

        // Reset visible action buttons
        editBtn.classList.remove('d-none');
        saveBtn.classList.add('d-none');
        cancelBtn.classList.add('d-none');
    }
});