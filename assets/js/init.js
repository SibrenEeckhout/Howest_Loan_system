const url = `https://api.reservaties-sportmateriaalsb.be/api/`

document.addEventListener("DOMContentLoaded", init);


let displayedItems = []; // Array to store items that match the filter
let allItems = []; // Array to store all items (your JSON data)

function init(){
    fetch(`https://api.reservaties-sportmateriaalsb.be/api/sport-articles`)
    .then((response) => response.json())
    .then((json) => {
        allItems = json; // Store all items
        displayedItems = json; // Initially, display all items
        addItemsToList(displayedItems);
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });


    document.querySelector(`input`).addEventListener(`input`, handleFilter);

    document.querySelector('section').addEventListener('click', function (event) {
        const target = event.target.closest('.template-item');

        if (target) {
            reserveItem(target);
        }
    });

    document.querySelector(`#submit`).addEventListener(`click`, handleForm);
    document.querySelector(`#cancel`).addEventListener(`click`, cancelForm);


}

function handleFilter(e) {
    const inputText = e.target.value.toLowerCase();

    // Filter items based on the input text
    displayedItems = allItems.filter(item => item.name.toLowerCase().includes(inputText));

    // Clear the current items on the page
    const section = document.querySelector('section');
    section.innerHTML = '';

    // Add the matching items to the page
    displayedItems.forEach(item => {
        const cleanedName = item.name.replace(/\s+/g, '-');
        const $template = document.querySelector('.template').content.firstElementChild.cloneNode(true);
        $template.id = item.id;
        $template.querySelector('h2').insertAdjacentHTML("afterbegin", item.name);
        $template.querySelector('h2').classList.add(`${item.id}`)
        $template.querySelector('#amount_of_items').insertAdjacentHTML("afterbegin", item.count);
        if(item.image){
            $template.querySelector('.first').insertAdjacentHTML("afterbegin", `<img src="${item.image}" alt=""/>`);
        }else{
            $template.querySelector('.first').insertAdjacentHTML("afterbegin", `<img src="./assets/Images/voetbal.jpg" alt=""/>`);
        }
        $template.classList.add('template-item'); // Add a class for template items
        section.insertAdjacentHTML("beforeend", $template.outerHTML);

    });
}

function addItemsToList(json) {
    json.forEach(item => {
        const cleanedName = item.name.replace(/\s+/g, '-');
        const $template = document.querySelector('.template').content.firstElementChild.cloneNode(true);
        $template.id = item.id;
        $template.querySelector('h2').insertAdjacentHTML("afterbegin", item.name);
        $template.querySelector('h2').classList.add(`${item.id}`)
        $template.querySelector('#amount_of_items').insertAdjacentHTML("afterbegin", item.count);
        if(item.image){
            $template.querySelector('.first').insertAdjacentHTML("afterbegin", `<img src="${item.image}" alt=""/>`);
        }else{
            $template.querySelector('.first').insertAdjacentHTML("afterbegin", `<img src="./assets/Images/voetbal.jpg" alt=""/>`);
        }   

        $template.classList.add('template-item'); // Add a class for template items
        document.querySelector('section').insertAdjacentHTML("beforeend", $template.outerHTML);
    });
}

async function fetchItemById(id) {
    try {
      const response = await fetch(`https://api.reservaties-sportmateriaalsb.be/api/sport-articles/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching item:', error);
      return null;
    }
  }
  
  function reserveItem(item) {
    console.log(item);
  
    let form = document.querySelector(`#form`);
    let id = item.id;
    console.log(id);
  
    // Fetch item details by ID
    fetchItemById(id)
      .then((itemDetails) => {
        // Update form elements with item details
        form.querySelector(`h2`).innerText = itemDetails.name;
        form.querySelector(`p`).innerText = itemDetails.description;
      })
      .catch((error) => {
        console.error('Error fetching item details:', error);
      });
  
    const submitButton = form.querySelector('#submit');
    submitButton.className = ''; // This removes all classes
  
    form.querySelector(`#submit`).classList.add(`${id}`);
    form.classList.remove(`hidden`);
  }
  

function handleForm(e) {
    e.preventDefault();

    // Assuming the ID is stored in a data attribute on the form element
    let sportArticleId = e.target.classList.value;
    console.log(sportArticleId);
    console.log(e.target);

    // Fetch the form input values
    let startDate = document.getElementById('dateUitlenen').value;
    let endDate = document.getElementById('dateTerugbrengen').value;
    let count = document.getElementById('count').value;
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let phone = document.getElementById('phone').value;

    // Prepare the data object
    let formData = {
        "sport_article_id": sportArticleId,
        "count": count,
        "name": name,
        "email": email,
        "phone": phone,
        "course": "idk",
        "start_date": startDate,
        "end_date": endDate
    };

    // Make the API call
    fetch('https://api.reservaties-sportmateriaalsb.be/api/reservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        validPopup('Aanvraag tot reservatie is geslaagd. Bekijk je mails voor een bevestiging.')
        // Handle success, update UI, etc.
    })
    .catch((error) => {
        console.error('Error:', error);
        errorPopup(error)
        // Handle error, show error message, etc.
    });

    // Your existing code here
    console.log(e.target);
    document.querySelector('#form').classList.add('hidden');
}


function cancelForm(e){
    e.preventDefault()
    console.log(e.target)
    document.querySelector(`#form`).classList.add(`hidden`)
    validPopup("Form successfully canceled.")
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