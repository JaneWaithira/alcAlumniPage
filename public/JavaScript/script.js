let events = '';

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM content loaded");
    var sidebar = document.querySelector('.side-bar');
    var sidebarItems = document.querySelectorAll('.menu-item');
    var modal = document.getElementById('addEventForm');

    // Get reference to the root container
    var rootContainer = document.querySelector('.event-home');
    var addEventFormDiv = document.getElementById('addEventForm');
    var myEventsDiv = document.querySelector('.myEvents');

    // check add event form submission
    function checkFormSubmissionStatus() {
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        if (message) {
            alert(message);
        }
    }

    document.addEventListener('DOMContentLoaded', checkFormSubmissionStatus);

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

            } else if (menuItemId === 'myEventsButton') {
                fetch('/events/myEvents')
                    .then(response => response.text())
                    .then(data => {
                        rootContainer.innerHTML = data;
                        history.pushState(null, null, '/events/myEvents');
                    })
                    .catch(error => console.error(error));
            } else if (menuItemId === 'eventsButton') {
                fetch('/events/allEvents')
                    .then(response => response.text())
                    .then(data => {
                        rootContainer.innerHTML = data;
                        history.pushState(null, null, '/events/allEvents');
                    })
                    .catch(error => console.error(error));
            } else if (menuItemId === 'savedEventsButton') {
                fetch('/events/savedEvents')
                    .then(response => response.text())
                    .then(data => {
                        rootContainer.innerHTML = data;
                        history.pushState(null, null, '/events/savedEvents');
                    })
                    .catch(error => console.error(error));
            }
            else {
                
            }
        });
    });

    function closeAddEventModal() {
        modal.style.display = 'none';
    }

    function clearPageContent() {
        // Clear the content of the root container
        rootContainer.innerHTML = '';
        addEventFormDiv.innerHTML = '';
        myEventsDiv.innerHTML = '';
    }
    clearPageContent();
    closeAddEventModal();

    // render events
    function renderAllEvents() {
        fetch('/events/allEvents')
            .then(response => response.text())
            .then(data => {
                events = data;
                const myEventsDiv = document.querySelector('.event-home');
                myEventsDiv.innerHTML = data;
                //console.log('Filtered events include: ', events)
            })
            .catch(error => console.error('Error fetching events:', error));
    }
    
    // // Apply filter
    function applyFilters() {
        // Get input values
        const searchInputValue = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilterValue = document.getElementById('categoryFilter').value.toLowerCase();
        const dateFilterValue = document.getElementById('dateFilter').value.toLowerCase();
        const locationFilterValue = document.getElementById('locationFilter').value.toLowerCase();

        console.log('Search Input:', searchInputValue);
        console.log('Category Filter:', categoryFilterValue);
        console.log('Date Filter:', dateFilterValue);
        console.log('Location Filter:', locationFilterValue);

        // Get all event elements
        const eventElementss = document.querySelectorAll('.event');
        const visibleEvents = [];
        eventElementss.forEach(eventElementiy => {
            const titleMatches = eventElementiy.querySelector('.title').innerText.toLowerCase().includes(searchInputValue);
            const categoryMatches = categoryFilterValue === '' || eventElementiy.querySelector('.category').innerText.toLowerCase() === categoryFilterValue;
            const dateMatches = dateFilterValue === '' || eventElementiy.querySelector('.date').innerText.toLowerCase().includes(dateFilterValue);
            const locationMatches = locationFilterValue === '' || eventElementiy.querySelector('.location').innerText.toLowerCase().includes(locationFilterValue);

            if (titleMatches && categoryMatches && dateMatches && locationMatches) {
                visibleEvents.push(eventElementiy);
                eventElementiy.classList.remove('hide-event'); // Show the event
            } else {
                eventElementiy.classList.add('hide-event');  // Hide the event
               
            }
        });
        // Get the offset of the filter section
        const filterSectionOffset = document.querySelector('.search-filter-section').offsetTop;
        // Move visible events to the top without leaving gaps
        let topPosition = filterSectionOffset + document.querySelector('.search-filter-section').offsetHeight;
        // Move visible events to the top without leaving gaps
        visibleEvents.forEach((visibleEvent, index) => {
            // Update the styles or positioning as needed
            visibleEvent.style.position = 'absolute';
            visibleEvent.style.top = `${topPosition}px`; // Set the top position based on the filter section height
            topPosition += visibleEvent.offsetHeight + 25; // Add the height of the current event and the desired gap
        });

        console.log('Applied filters', eventElementss);
    }

    document.getElementById('filterButton').addEventListener('click', applyFilters);
    renderAllEvents();

    // Saved events
    function handleRSVPClick(button) {
        const eventId = button.dataset.eventId;


        console.log('Event ID:', eventId);
        // send request to the server to handle rsvp logic
        fetch(`/events/rsvp/${eventId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(response => {
                if (response.ok) {
                    // update UI
                    button.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
                    button.classList.add('saved');
                } else {
                    console.error('Error handling RSVP. Server response:', response.status, response.statusText);
                    // Log additional details if available
                    return response.text().then(errorText => {
                        console.error('Error details:', errorText);
                    });
                }
            })
            .catch(error => {
                console.error('Error handling RSVP:', error);
            });
    }


    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('rsvp')) {
            handleRSVPClick(event.target);
        }
    });

    // Add an event listener for cancel button clicks
    document.addEventListener('click', function (event) {
        if (event.target && event.target.classList.contains('cancel')) {
            handleCancelClick(event.target);
        }
    });

    // Function to handle cancel button click
    function handleCancelClick(button) {
        const eventId = button.dataset.eventId;

        // Send request to the server to handle cancel logic
        fetch(`/events/cancel/${eventId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        })
            .then(response => {
                if (response.ok) {
                    // Remove the canceled event from the UI
                    const eventContainer = button.closest('.event');
                    eventContainer.remove();
                } else {
                    console.error('Error handling cancel. Server response:', response.status, response.statusText);
                    // Log additional details if available
                    return response.text().then(errorText => {
                        console.error('Error details:', errorText);
                    });
                }
            })
            .catch(error => {
                console.error('Error handling cancel:', error);
            });
    }

});


// My events page
// display edit event form
function displayPopUp() {
    const popupOverlay = document.getElementById('popupOverlay');
    const popupContainer = document.getElementById('editEventpop');

    // Display the overlay and popup
    popupOverlay.style.display = 'block';
    popupContainer.style.display = 'block';
}

function closeEditPopUp() {
    const popupOverlay = document.getElementById('popupOverlay');
    const popupContainer = document.getElementById('editEventpop');

    // Hide the overlay and popup
    popupOverlay.style.display = 'none';
    popupContainer.style.display = 'none';
}




// edit event
let currentEventId = null;
function editEvent(eventId, event) {
    currentEventId = eventId;
    console.log(eventId);
    // Fetch event details for the given eventId from the server using AJAX
    fetch(`/events/myEvents/${eventId}`)
        .then(response => response.json())
        .then(eventDetails => {
            // Populate the add event form fields with the fetched event details
            document.getElementById('editTitle').value = eventDetails.title;
            document.getElementById('editDescription').value = eventDetails.description;
            document.getElementById('editLocation').value = eventDetails.location;
            document.getElementById('editCategory').value = eventDetails.category;
            document.getElementById('editStartDateTime').value = eventDetails.startDateTime;
            document.getElementById('editEndDateTime').value = eventDetails.endDateTime;

            // Display the add event form
            document.getElementById('editEventForm').style.display = 'block';
            console.log(" mustache-edit event: I ve been called");
        })
        .catch(error => {
            console.error(error);
        });
}



// Save edited event 
function saveEditedEvent(event) {
    event.preventDefault();
    const eventId = currentEventId;
    console.log('Save Edited Event function called');
    console.log('Save edited event ID', eventId);
    // Retrieve edited event details from the add event form fields
    const editedTitle = document.getElementById('editTitle').value;
    const editedDescription = document.getElementById('editDescription').value;
    const editedLocation = document.getElementById('editLocation').value;
    const editedCategory = document.getElementById('editCategory').value;
    const editedStartDateTime = document.getElementById('editStartDateTime').value;
    const editedEndDateTime = document.getElementById('editEndDateTime').value;


    // Construct the updatedFields object
    const updatedFields = {
        title: editedTitle,
        description: editedDescription,
        location: editedLocation,
        category: editedCategory,
        startDateTime: editedStartDateTime,
        endDateTime: editedEndDateTime
    };

    // Send AJAX request to update event details on the server
    fetch(`/events/myEvents/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFields)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok');
        })
        .then(data => {
            console.log('Response from server:', data);
            const { updatedEvent, allEvents } = data;

            const eventContainers = document.getElementsByClassName('event-container');
            Array.from(eventContainers).forEach(eventsContainer => {
                eventsContainer.innerHTML = '';
                allEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event');
                    eventElement.innerHTML = `
                    <div class="image-div">
                        ${Array.isArray(event.image) ? event.image.map(image => `<img class="event-image" src="${image}" alt="Event Image">`).join('') : ''}
                    </div>
                    <div class="event-details">
                        <a class="title">${event.title}</a><br>
                        <a class="date">${event.startDateTime} - ${event.endDateTime}</a><br>
                        <a class="location">${event.location}</a><br>
                        <a class="category">${event.category}</a><br>
                        <a class="description">${event.description}</a><br>
                        <div class="buttons">
                            <button class="edit-button" onclick="editEvent('${event._id}', event)">Edit</button>
                            <button class="delete-button" onclick="confirmDelete('${event._id}', event)">Delete</button>
                        </div>
                    </div>
                `;
                    eventsContainer.appendChild(eventElement);
                    closeEditPopUp();
                });
            });
        })

        .catch(error => {
            console.log(error);
        });
}




function confirmDelete(eventId, event) {
    // Prevent the default behavior of the button click event
    const isConfirmed = window.confirm('Are you sure you want to delete this event?');

    if (isConfirmed) {
        console.log(eventId);
        fetch(`/events/myEvents/${eventId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.status === 204) {
                    console.log('Event deleted successfully');
                  
                    location.reload(); // Reload the page after successful deletion
                } else if (response.ok) {
                    console.log('Event deleted successfully');
                   
                } else {
                    console.log(`/events/myEvents/${eventId}`);
                    console.error('Error deleting event');
                    
                }
            })
            .catch(error => {
                console.error('Error:', error);
                
            });
    }
}