let items;
let cookie;
let url = `https://api.reservaties-sportmateriaalsb.be/api/`
let token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS55b25pZGVibGVla2VyLmJlL2FwaS9sb2dpbiIsImlhdCI6MTcwMDY0MDI2OSwiZXhwIjoxNzAwNjQzODY5LCJuYmYiOjE3MDA2NDAyNjksImp0aSI6InVPd1VyQ1JoM0tWV2oiMjNiZDVjODk0OWY2MDBhZGIzOWU3MDFjNDAwODcyZGI3YTU5NzZmNyJ9.Mm9R7x6KrxllpEKRy4n1zWil0GepZR7Nr3hEv4Syhgo`

document.addEventListener("DOMContentLoaded", init);

function init(){
    document.querySelector(`#login #submit`).addEventListener(`click`, login)
    document.querySelector(`#addMaterial form`).addEventListener(`submit`, addMaterial)
    document.querySelector('#filterOnName').addEventListener('input', filterItems);
}


function login(e) {
    e.preventDefault();
    const emailInput = document.querySelector('#name');
    const passwordInput = document.querySelector('#password');

    const email = emailInput.value;
    const password = passwordInput.value;

    authenticateUser(email, password)
        .then(result => {
            validPopup("Login successful")
            fetchItems();
            fetchConfirmedReservations();
            fetchPotentialReservations();
            makeDashBoardUnhidden();
            removeLoginForm();

            fetchAndInitializeCalendar();
        })
        .catch(error => {
            console.log(error);
            errorPopup("Failed to login.")
        });
}

async function authenticateUser(email, password) {

    if (email.endsWith("howest.be")) {
        const apiUrl = url + 'login';  
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
                errorPopup(response.statusText)
            }
            
            console.log(response);

            const result = await response.json();
            token = result.authorisation.token

            return result;

        } catch (error) {
            console.error('Authentication error:', error.message);
            throw new Error('Authentication failed');
            errorPopup("Authentication failed.")
        }

    } else {
        throw new Error("Email must end with 'howest.be'");
    }
}

function removeLoginForm(){
    document.querySelector(`#loginForm`).classList.add("hidden");
}

function makeDashBoardUnhidden(){
    document.querySelector(`#PotentialReservations`).classList.remove("hidden")
    document.querySelector(`#addMaterial`).classList.remove("hidden")
    document.querySelector(`#updateMaterial`).classList.remove("hidden")
    document.querySelector(`#reservations`).classList.remove("hidden")
    document.querySelector(`#calendar`).classList.remove("hidden")
}

function fetchItems() {

   fetch(url + "sport-articles")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then((json) => {
            items = json; // Store all items
            filterItems();
            fetchItemsInUpdateColumn(items);
        })
        .catch((error) => {
            console.error("Error fetching items:", error.message);
            errorPopup("Error fetching items: " + error.message)
        });
}



function fetchPotentialReservations() {
    fetch(url + "reservations", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(items => {
        console.log(items);
        fetchPotentialReservationsHtml(items);
    })
    .catch(error => {
        console.error('Error fetching potential reservations:', error.message);
        errorPopup('Error fetching potential reservations: ' + error.message)
    });
}

function fetchPotentialReservationsHtml(items){
    const ul = document.querySelector(`#PotentialReservations ul`)
    ul.innerHTML = ""
    items.forEach(item =>{
        console.log(item);
        const listItem = document.createElement('li');
        ul.appendChild(listItem);
        const article = document.createElement('article')
        article.id = item.id

        const divOne = document.createElement('div')
        const divTwo = document.createElement('div')

        divOne.insertAdjacentHTML(`beforeend`, `<h4>${item.name} (${item.phone})</h4>`)
        divOne.insertAdjacentHTML(`beforeend`, `<p>${item.start_date} - ${item.end_date}</p>`)
        divOne.insertAdjacentHTML(`beforeend`, `<p>${item.count}X ${item.sportarticle.name}</p>`)

        divTwo.insertAdjacentHTML(`beforeend`, `<button class="cancel">Weiger</button>`)
        divTwo.insertAdjacentHTML(`beforeend`, `<button class="accept">Bevestig</button>`)

        listItem.appendChild(article)
        article.appendChild(divOne)
        article.appendChild(divTwo)

        divTwo.querySelector(`.cancel`).addEventListener(`click`, cancelReservation);

        divTwo.querySelector(`.accept`).addEventListener(`click`, acceptReservation);

    })
}

function fetchConfirmedReservations() {
    const apiUrl = 'https://api.reservaties-sportmateriaalsb.be/api/reservations?approved=True';

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        fetchReservations(data);
    })
    .catch(error => {
        console.error('Error fetching confirmed reservations:', error.message);
        errorPopup('Error fetching confirmed reservations: ' + error.message)
    });
}

function fetchReservations(items) {
    const ul = document.querySelector(`#reservations ul`)
    ul.innerHTML = ""
    items.forEach(item => {
        const listItem = document.createElement('li');
        ul.appendChild(listItem);

        const divTwo = document.createElement('div')
        divTwo.classList.add("switch-container")
        const article = document.createElement('article')
        const div = document.createElement('div')

        div.insertAdjacentHTML(`beforeend`, `<h4>${item.sportarticle.name}</h4>`)
        div.insertAdjacentHTML(`beforeend`, `<p>${item.start_date} - ${item.end_date}</p>`)
        div.insertAdjacentHTML(`beforeend`, `<p>${item.name}</p>`)
        div.insertAdjacentHTML(`beforeend`, `<p>${item.phone}</p>`)
        div.insertAdjacentHTML(`beforeend`, `<p>${item.email}</p>`)

        divTwo.insertAdjacentHTML(`beforeend`, `<span class="label-left">in</span>`)
        divTwo.insertAdjacentHTML(`beforeend`, `<label class="switch">
            <input type="checkbox" ${item.lent === 1 ? 'checked' : ''}>
            <span class="slider round"></span>
        </label>`)
        divTwo.insertAdjacentHTML(`beforeend`, `<span class="label-right">uit</span>`)

        listItem.appendChild(article)
        article.appendChild(div)
        article.appendChild(divTwo)

        // Get the checkbox element
        const checkbox = divTwo.querySelector('input[type="checkbox"]');

        // Toggle between two functions on checkbox click
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                addComfirmed(item);
            } else {
                deleteReservation(item);
            }
        });
    })
}



function addComfirmed(item) {
    const fullUrl = `https://api.reservaties-sportmateriaalsb.be/api/reservations/${item.id}/lent`;
    
    fetch(fullUrl, {
      method: 'PUT', // or 'PUT' depending on your API
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        confirmed: true
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Confirmation successful:', data);
      // Add any additional logic here if needed
    })
    .catch(error => {
      console.error('Error confirming reservation:', error);
      // Handle errors appropriately
    });
  }
  

function deleteReservation(item) {
    // Extract the id from the item
    const id = item.id;

    // URL for the DELETE request
    let fullUrl = `https://api.reservaties-sportmateriaalsb.be/api/reservations/${id}`;

    // Fetch options for the DELETE request
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    };

    // Send the DELETE request
    fetch(fullUrl, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
                errorPopup("Failed to delete reservation.")
            }
            return response.json();
        })
        .then(data => {
            console.log('Reservation deleted successfully:', data);
            validPopup("'Reservation deleted successfully")
        })
        .catch(error => {
            console.error('Error deleting reservation:', error);
            errorPopup("Failed to delete reservation.")
        });
}

function fetchItemsInUpdateColumn(items) {
    const parentElement = document.querySelector('#updateList'); 
    parentElement.innerHTML = "";
    
    items.forEach(item => {
        console.log(item);
        const listItem = document.createElement('li'); 
        parentElement.appendChild(listItem);

        const form = document.createElement('form');
        form.classList.add(`${item.id}`);
        listItem.appendChild(form);
        form.addEventListener(`submit`, updateItem);

        const divOne = document.createElement('div');
        const divTwo = document.createElement('div');

        form.appendChild(divOne);
        form.appendChild(divTwo);

        divOne.classList.add('img');
        divTwo.classList.add('second');

        // Check if the item has an image
        if (item.image) {
            divOne.insertAdjacentHTML(`beforeend`, `<img src="${item.image}" alt="Image">`);
        } else {
            // If there's no image, use a placeholder or default image
            divOne.insertAdjacentHTML(`beforeend`, `<img src="../../assets/Images/img_1.png" alt="Default Image">`);
        }

        divOne.insertAdjacentHTML(`beforeend`, `<input type="file" id="image" name="img">`);

        const divThree = document.createElement('div');
        divThree.classList.add("flex");
        divThree.insertAdjacentHTML(`beforeend`, `<label for="qt"></label>`);
        divThree.insertAdjacentHTML(`beforeend`, `<input type="number" id="qt" value="${item.count}">`);
        divThree.insertAdjacentHTML(`beforeend`, `<button id=${item.id} class="remove">Verwijder</button>`);
        divThree.insertAdjacentHTML(`beforeend`, `<button>Pas aan</button>`);

        divThree.querySelector(`.remove`).addEventListener(`click`, removeItem);

        divTwo.insertAdjacentHTML(`beforeend`, `<label for="${item.name}"></label>`);
        divTwo.insertAdjacentHTML(`beforeend`, `<input type="text" id="titel" value="${item.name}">`);
        divTwo.insertAdjacentHTML(`beforeend`, `<label for="changeDescription"></label>`);
        divTwo.insertAdjacentHTML(`beforeend`, `<textarea id="changeDescription" rows="5">${item.description}</textarea>`);
        divTwo.appendChild(divThree);
    });
}




function removeItem(e) {
    e.preventDefault();

    const form = e.target;
    let id = form.id;
    console.log(form.id);

    // Make the API call to remove the sport article
    fetch(url + `sport-articles/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        console.log('Sport article removed successfully');
        validPopup("Sport article removed successfully")
        // Optionally, you can handle the response or perform additional actions here
    })
    .catch(error => {
        console.error('Error removing sport article:', error.message);
        errorPopup('Error removing sport article:' + error.message)
    });
}

/*
function updateItem(e) {
    e.preventDefault(); 

    const form = e.target;
    const id = form.classList.value;

    const imageInput = form[0];
    const title = form[1].value;
    const description = form[2].value;
    const qt = form[3].value;

    // Create a FormData object
    const formData = new FormData();

    // Add non-image data to 'json_data' key
    const jsonData = {
        name: title,
        description: description,
        count: qt,
        max_reservation_days: 2,
    };
    formData.append('json_data', JSON.stringify(jsonData));

    // Check if there is a file selected
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const blob = new Blob([file], { type: file.type });

        // Add the image blob to 'image' key
        formData.append('image', blob, file.name);
    }

    // Log the values
    console.log("ID: " + id);
    console.log("Title: " + title);
    console.log("Description: " + description);
    console.log("Quantity: " + qt);
    console.log("Image File:", imageInput.files[0]);

    // Make the API call to update the sport article
    fetch(url + `sport-articles/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        console.log('Sport article updated successfully');
        validPopup('Sport article updated successfully');
        // Optionally, you can handle the response or perform additional actions here
    })
    .catch(error => {
        console.error('Error updating sport article:', error.message);
        errorPopup('Error updating sport article:' + error.message);
    });
}
*/

function updateItem(e) {
    e.preventDefault(); 

    const form = e.target;
    let id = form.classList.value;
    console.log(id);
    console.log(form);

    let image = form[0].value;
    let title = form[1].value;
    let description = form[2].value;
    let qt = form[3].value;

    // Create the request body
    const requestBody = {
        name: title,
        description: description,
        image: "image",
        count: qt,
        max_reservation_days: "2", // Assuming it's always 2 as you mentioned
    };

    // Make the API call to update the sport article
    fetch(url + `sport-articles/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        console.log('Sport article updated successfully');
        validPopup('Sport article updated successfully')
        // Optionally, you can handle the response or perform additional actions here
    })
    .catch(error => {
        console.error('Error updating sport article:', error.message);
        errorPopup('Error updating sport article:' + error.message)
    });
}

function cancelReservation(e){
    e.preventDefault();
    const id = e.target.closest('article').id
    console.log(id);

    // cancel the reservation
    cancelReservationPost(id);
}

function acceptReservation(e) {
    e.preventDefault();
    const id = e.target.closest('article').id
    console.log(id);

    // post to accept the reservation
    acceptReservationPost(id)
}

function getArticleElementId(e){
    const articleElement = e.currentTarget.closest("article");
    return articleElement.classList[0];
}

function cancelReservationPost(id) {

    fetch(url + `reservations/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        console.log('Reservation canceled successfully');
        validPopup("Reservation canceled successfully")
        reloadDashboard();
    })
    .catch(error => {
        console.error('Error canceling reservation:', error.message);
        errorPopup('Error canceling reservation:' + error.message)
    });
}

function acceptReservationPost(id) {
    const apiUrl = `${url}reservations/${id}`;
    console.log(apiUrl);

    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        console.log('Reservation accepted successfully');
        validPopup("Reservation accepted successfully")
        reloadDashboard();
    })
    .catch(error => {
        console.error('Error accepting reservation:', error.message);
        errorPopup('Error accepting reservation:' + error.message)
    });
}

function addMaterial(e) {
    e.preventDefault();

    // Access the form element
    const form = document.querySelector('#addMaterial form');

    // Get the values of input fields
    const itemName = form.querySelector('#itemName').value;
    const amount = form.querySelector('#amount').value;
    const description = form.querySelector('#description').value;
    const imgInput = form.querySelector('#img');
    
    // Create a FormData object
    const formData = new FormData();

    // Add non-image data to 'json_data' key
    const jsonData = {
        name: itemName,
        description: description,
        count: amount,
        max_reservation_days: 2,
    };
    formData.append('json_data', JSON.stringify(jsonData));

    // Check if there is a file selected
    if (imgInput.files.length > 0) {
        const file = imgInput.files[0];
        const blob = new Blob([file], { type: file.type });

        // Add the image blob to 'image' key
        formData.append('image', blob, file.name);
    }

    form.reset();

    // Log the values
    console.log("Item Name: " + itemName);
    console.log("Amount: " + amount);
    console.log("Description: " + description);
    console.log("Image File:", imgInput.files[0]);

    // Make the API call to add new material
    fetch(url + 'sport-articles', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        console.log('Material added successfully');
        validPopup('Material added successfully');
        reloadDashboard();
        // Optionally, you can handle the response or perform additional actions here
    })
    .catch(error => {
        console.error('Error adding material:', error.message);
        errorPopup('Error adding material:' + error.message);
    });
}




async function fetchAndInitializeCalendar() {
    try {
        const response = await fetch('https://api.reservaties-sportmateriaalsb.be/api/reservations?approved=1', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const events = await response.json();
        // Wait for the data to be fetched, then create the calendar
        createCalendar(events);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


function createCalendar(events) {
    var data = [];

    events.forEach(event => {
        // Add event for start date
        data.push({
            eventName: event.name + "(Start)",
            calendar: 'Work',
            color: 'orange',
            date: event.start_date,
        });

        // Add event for end date
        data.push({
            eventName: event.name + ' (End)',
            calendar: 'Work',
            color: 'blue',
            date: event.end_date,
        });
    });
    console.log(data)

    // The rest of your calendar creation code
    var calendar = new Calendar('#calendar', data);
}

function reloadDashboard(){
    fetchItems();
    fetchConfirmedReservations();
    fetchPotentialReservations();
    makeDashBoardUnhidden();
    removeLoginForm();
}


function errorPopup(errorMessage) {
    console.log("koas");
    const errorPopupElement = document.getElementById('errorPopup');
    errorPopupElement.textContent = errorMessage;
    errorPopupElement.style.display = 'block';

    setTimeout(() => {
        errorPopupElement.style.display = 'none';
    }, 3000); // Adjust the time (in milliseconds) you want the error message to be displayed
}

function validPopup(validMessage) {
    const validElement = document.getElementById('validPopup');
    validElement.textContent = validMessage;
    validElement.style.display = 'block';

    setTimeout(() => {
        validElement.style.display = 'none';
    }, 3000); // Adjust the time (in milliseconds) you want the error message to be displayed
}

function filterItems() {
    const filterText = document.querySelector('#filterOnName').value.toLowerCase();
    let filteredItems =[];
    fetch(url + "sport-articles")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(items => {
            items.forEach(item => {
                const itemName = item.name.toLowerCase();
                console.log(filterText, item.name);
                if(itemName.includes(filterText)){
                    filteredItems.push(item)
                }
            })
            console.log(filteredItems);
            fetchItemsInUpdateColumn(filteredItems);
        })
        .catch(error => {
            console.error("Error fetching items:", error.message);
            errorPopup("Error fetching items: " + error.message);
        });
}

/*function uploadfiles(){
    const filteInput = document.querySelector('input[type=file]')
    const files = filteInput.files;

    const formdata = new FormData();
    const jsonData = {

    }

    for (let i = 0; i < files.length; i++){
        const file = files[i]
        const blob = new Blob([file], {type: file.type});
        formdata.append('files[]', Blob, file.name)
    }
}*/