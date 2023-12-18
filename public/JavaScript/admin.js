document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM content loaded");
    var sidebar = document.querySelector('.side-bar');
    var sidebarItems = document.querySelectorAll('.menu-item');
    var modal = document.getElementById('addEventForm');

    function updateSidebar() {
        if (window.innerWidth <= 991) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }

    // Initial update
    updateSidebar();

    // Update on window resize
    window.addEventListener('resize', updateSidebar);

    sidebarItems.forEach(item => {
        item.addEventListener('click', function () {
            var menuItemId = this.id;
            if (menuItemId === 'addEventButton') {
                fetch('/events/addEvent')
                    .then(response => response.text())
                    .then(data => {
                        var modalClone = modal.cloneNode(true);
                        modal.parentNode.replaceChild(modalClone, modal);
                        modal = modalClone;
                        modal.innerHTML = data;
                        modal.style.display = 'block';
                    })
                    .catch(error => console.error(error));
            } else if (menuItemId === 'dashboard') {
                // Instead of manipulating the URL and rendering, call the function to render alumni
                renderAllAlumni();
            } else if (menuItemId === 'allEventsButton') {
                renderAllEvents();
            } else {
                // Handle other menu items as needed
            }
        });
    });

    function renderAllAlumni() {
        fetch('/admin/alumni')
            .then(response => response.text()) // Parse the HTML
            .then(data => {
                console.log("This is the data", data);
                const tableDataDiv = document.querySelector('.table-data');
                // Update the tableDataDiv with the fetched HTML
                tableDataDiv.innerHTML = data;
                attachEventListeners();
                console.log("Alumni data rendered");
            })
            .catch(error => console.error('Error fetching alumni:', error));
    }

    function attachEventListeners() {
        const editButtons = document.querySelectorAll('.edit-btn');
        const saveButtons = document.querySelectorAll('.save-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');

        editButtons.forEach(button => {
            button.addEventListener('click', function () {
                const alumniId = this.getAttribute('data-alumni-id');
                editAlumni(alumniId);
            });
        });

        saveButtons.forEach(button => {
            button.addEventListener('click', function () {
                const alumniId = this.getAttribute('data-alumni-id');
                saveEdit(alumniId);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', function () {
                const alumniId = this.getAttribute('data-alumni-id');
                deleteAlumni(alumniId);
            });
        });

        // Adding event listeners for cancel buttons
        const cancelButtons = document.querySelectorAll('.cancel');

        cancelButtons.forEach(button => {
            button.addEventListener('click', function () {
                const eventId = this.getAttribute('data-event-id');
                deleteEvent(eventId);
            });
        });
    }

    async function saveEdit(alumniId) {
        const updatedName = document.querySelector(`[data-alumni-id="${alumniId}"][data-field="name"]`).innerText;
        const updatedEmail = document.querySelector(`[data-alumni-id="${alumniId}"][data-field="email"]`).innerText;
        const updatedYear = document.querySelector(`[data-alumni-id="${alumniId}"][data-field="year"]`).innerText;

        try {
            const response = await fetch(`/admin/alumni/${alumniId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: updatedName,
                    email: updatedEmail,
                    year: updatedYear,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Alumni updated successfully');
            } else {
                console.error('Error updating alumni:', data.error);
            }
        } catch (error) {
            console.error('Error updating alumni:', error);
        }
    }

    function deleteAlumni(alumniId) {
        if(!confirm("Are you sure you want to delete this alumni?")) {
            return;
        }
        fetch(`/admin/alumni/${alumniId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok){
                throw new Error('Error deleting alumni');
            }
            return response.json();
        })
        .then (data => {
            console.log('Alumni deleted succesfully: ', data);
            removeAlumniFromRowUI(alumniId);
        })
        .catch(error => {
            console.error('Error: ', error);
        });
    }

    function removeAlumniFromRowUI(alumniId){
        const rowToDelete = document.querySelector(`[data-alumni-id="${alumniId}]`).closest('tr');
        if (rowToDelete) {
            rowToDelete.remove();
        }
    }


    function renderAllEvents() {
        fetch('/admin/events')
            .then(response => response.text())
            .then(data => {
                const tableDataDiv = document.querySelector('.table-data');
                tableDataDiv.innerHTML = data;
                attachEventListeners(); // Make sure to attach event listeners after rendering
            })
            .catch(error => console.error('Error fetching all events:', error));
    }

    // Call renderAllAlumni on DOMContentLoaded
    renderAllAlumni();

    // Delete event
    function deleteEvent(eventId) {
        fetch(`/events/myEvents/${eventId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Optionally, you can update the UI to reflect the deletion
                    console.log(`Event ${eventId} deleted successfully`);
                } else {
                    console.error('Error deleting event:', data.error);
                }
            })
            .catch(error => console.error('Error deleting event:', error));
    }

  // add alumni
const addAlumniButton = document.getElementById('addAlumniButton');
addAlumniButton.addEventListener('click', function () {
    addAlumniRow();
});

function addAlumniRow() {
    const tableBody = document.querySelector('tbody'); // Update this selector based on your HTML structure
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td contenteditable="true" data-field="name">Add Name</td>
        <td contenteditable="true" data-field="email">Add Email</td>
        <td contenteditable="true" data-field="year">Add Year</td>
        <td>
            <button class="btn btn-success save-btn">Save</button>
        </td>
        <td>0</td>
        <td>0</td>
    `;
    tableBody.appendChild(newRow);

    // Add event listener to the save button of the new row
    const saveButton = newRow.querySelector('.save-btn');
    saveButton.addEventListener('click', async function () {
        const isSuccess = await saveAlumniDetailsToServer(newRow);
        if (isSuccess) {
            // Update UI only if the server operation was successful
            updateUI(newRow);
        } else {
            // Handle error or show a message to the user
            console.error('Error adding alumni to the server');
        }
    });
}


// Function to save alumni details to server
async function saveAlumniDetailsToServer(row) {
    const name = row.querySelector('[data-field="name"]').innerText;
    const email = row.querySelector('[data-field="email"]').innerText;
    const year = row.querySelector('[data-field="year"]').innerText;

    try {
        const response = await fetch('/admin/addAlumni', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, year }),
        });
        if (!response.ok) throw new Error("HTTP error! Status: ${response.status}");
        return true; // Success
    } catch (error) {
        console.error('Error adding alumni to server:', error);
        return false; // Failure
    }
}


// Function to update UI
function updateUI(row) {
    // Update the specific cells with the new data
    const nameCell = row.querySelector('[data-field="name"]');
    const emailCell = row.querySelector('[data-field="email"]');
    const yearCell = row.querySelector('[data-field="year"]');

    nameCell.contentEditable = false; // Disable editing after save
    emailCell.contentEditable = false;
    yearCell.contentEditable = false;

    // Add event listeners to the new buttons
    attachEventListeners(row);
}



});
