

// Fetch and display users

// Add your custom JavaScript logic when clicked
document.getElementById('users-nav-button').addEventListener('click', async function () {

    const users = await fetchUsers();// Your custom code here (e.g., fetch data, log events)

    const userTable = document.getElementById('userTable');
    const userTableBody = userTable.getElementsByTagName("tbody")[0];
    
    let tableHTML = '';
    users.forEach(user => {
        tableHTML += makeUserHtml(user);
    });
    userTableBody.innerHTML = tableHTML;
    document.getElementById("user-table-count").innerText = `Showing ${users.length} of ${users.length} users`


});
async function fetchUsers() {
    
    try {
        const response = await fetch(`/api/users`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const users = await response.json();

        return users;

        } catch (error) {
            console.error('Error fetching users:', error);
    }
}

function makeUserHtml(user){
    const userHtml =`
        <tr data-id="${user.id}">
            <td class="ps-4">
            <div class="d-flex align-items-center">
                <div class="placeholder text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-3"
                            style="width: 40px; height: 40px; background-color: ${user.avatar_color}; flex-shrink: 0">${user.initials}
                </div>
                <div class="editable fw-bold text-dark" data-field="name">${user.name}
                </div>
            </div>
            </td>
            
            <td>
                <div class="editable fw-bold text-dark" data-field="initials">${user.initials}
                </div>
            </td>
            <td><span class="editable-color" data-field="avatar_color">${user.avatar_color}</span>
            </td>
            <td class="text-end text-nowrap pe-4">
                
                <button class="btn btn-sm me-1 btn-outline-secondary  edit-btn">Edit
                </button>
                <button class="btn btn-sm btn-success save-btn d-none">
                    <span id="user${user.id}SaveBtnSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                    Save
                </button>
                <button class="btn btn-sm btn-secondary cancel-btn d-none">Cancel</button>
    
                <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})">
                    <span id="user${user.id}DeleteBtnSpinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                    Delete
                </button>
            </td>
        </tr>
        `;
    return userHtml;
}

// Handle form submission
const userForm = document.getElementById("userForm");
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const spinner = document.getElementById('userFormBtnSpinner');

    const name = document.getElementById('name').value;
    const initials = document.getElementById('initials').value;
    const avatar_color = document.getElementById('avatar-color').value;
    try {
        spinner.classList.remove("d-none");
        const response = await fetch(`/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, initials, avatar_color })
        });

        if (response.ok) {
            userForm.reset();
            const dataObject = await response.json();
            const userTable = document.getElementById('userTable');
            const userTableBody = userTable.getElementsByTagName("tbody")[0];
            userTableBody.innerHTML += makeUserHtml(dataObject);
            //fetchUsers(); // Refresh list

            const formElement = document.getElementById('collapseFormUser');
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(formElement);
            bsCollapse.hide();
        } else {
            const errData = await response.json();
            alert(`Error: ${errData.error}`);
        }
    } catch (error) {
        console.error('Error adding user:', error);
    } finally {
        spinner.classList.add("d-none");
    }
});
async function deleteUser(id) {

    const spinner = document.getElementById(`user${id}DeleteBtnSpinner`);

    const confirmed = await showConfirmModal("Are you sure you want to delete this record?");

    // if (confirm("Are you sure you want to delete this user?")) {
    if (confirmed){
        // Action to take if user clicked OK
        try {
            spinner.classList.remove("d-none");
            const deleteResponse = await fetch(`/api/users/update/${id}`, { method: 'DELETE' });

            if (!deleteResponse.ok) {
                throw new Error('Delete failed')
            }  
                const userTable = document.getElementById('userTable');
                userTable.querySelector(`[data-id="${id}"]`).remove();

            console.log("User deleted.");
        } catch (error) {
            console.error('Error:', error);
        } finally {
            spinner.classList.add("d-none");
        }
        
    } else {
        // Action to take if user clicked Cancel
        console.log("Action canceled.");
    }

}

document.getElementById('userTable').addEventListener('click', function (e) {
    const target = e.target;
    const row = target.closest('tr');
    if (!row) return;

    const rowId = row.getAttribute('data-id');
    const editCells = row.querySelectorAll('.editable');
    const editAvatarColor = row.querySelector('.editable-color');
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

        editAvatarColor.dataset.originalValue = editAvatarColor.innerText.trim();
        const currentText = editAvatarColor.innerText;
        editAvatarColor.innerHTML = `
            <input type="color" class="form-control form-control-color" value="${currentText}">`;

        // Toggle UI visibility using Bootstrap utility classes
        editBtn.classList.add('d-none');
        saveBtn.classList.remove('d-none');
        cancelBtn.classList.remove('d-none');
    }


    // --- 3. CLICK SAVE BUTTON (FETCH API) ---
    if (target.classList.contains('save-btn')) {
        const spinner = document.getElementById(`user${rowId}SaveBtnSpinner`);

        //const updatedData = { id: rowId };
        const updatedData = {};
        // Collect newly updated values from inputs
        editCells.forEach(cell => {
            const input = cell.querySelector('input');
            const fieldName = cell.getAttribute('data-field');
            updatedData[fieldName] = input.value.trim();
        });
        updatedData[editAvatarColor.getAttribute('data-field')] = editAvatarColor.querySelector('input').value.trim();

        // Disable Save button during API interaction to prevent double submissions
        saveBtn.disabled = true;
        //saveBtn.innerText = "Saving...";
        spinner.classList.remove("d-none");

        // Send payload via JSON to backend API using native JavaScript fetch
        fetch(`/api/users/update/${rowId}`, {
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
                //console.log(data);
                row.innerHTML = makeUserHtml(data);    
                //fetchUsers();
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
        
        
    };

    // --- 2. CLICK CANCEL BUTTON ---
    if (target.classList.contains('cancel-btn')) {
        editCells.forEach(cell => {
            // Revert back to original saved text value
            cell.innerText = cell.dataset.originalValue;
        });
        editAvatarColor.innerText = editAvatarColor.dataset.originalValue;
        // Reset visible action buttons
        editBtn.classList.remove('d-none');
        saveBtn.classList.add('d-none');
        cancelBtn.classList.add('d-none');
    }
});

function showConfirmModal(message) {
    return new Promise((resolve) => {
        const modalElement = document.getElementById('confirmModal');
        const bodyElement = document.getElementById('confirmModalBody');
        const confirmBtn = document.getElementById('confirmActionBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');

        // Update the message body text
        bodyElement.textContent = message;

        // Initialize Bootstrap Modal instance
        const bootstrapModal = new bootstrap.Modal(modalElement, {
            backdrop: 'static', // Prevents closing when clicking outside
            keyboard: false
        });

        bootstrapModal.show();

        // Define cleanup to prevent multiple event listeners stacking up
        const handleChoice = (choice) => {
            resolve(choice);
            bootstrapModal.hide();
            confirmBtn.removeEventListener('click', onConfirm);
            modalElement.removeEventListener('hidden.bs.modal', onCancel);
        };

        const onConfirm = () => handleChoice(true);
        const onCancel = () => handleChoice(false);

        // Event listeners
        confirmBtn.addEventListener('click', onConfirm);
        // Fires if user clicks cancel, close (X), or hits escape
        modalElement.addEventListener('hidden.bs.modal', onCancel);
    });
}