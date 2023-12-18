    // Get the modal element and the button that opens it
    var modal = document.getElementById('addEventForm');
    var addEventButton = document.getElementById('addEventButton');
    
    addEventButton.onclick = function() {
        fetch('/events/addEvent') // Fetch the template content
            .then(response => response.text())
            .then(data => {
                // Render the template inside the modal
                var modal = document.getElementById('addEventForm');
                modal.innerHTML = data;
                modal.style.display = 'block';
            })
            .catch(error => console.error(error));
           
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    function closeAddEventModal() {
        modal.style.display = 'none';
    }
    