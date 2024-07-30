
const CARDS_PER_PAGE = 12; //number of cards per page
const userEmail = getUser();
const accessRight: string[] = ['admin', 'readAndWrite', 'read'];
const pageNames: string[] = [`home`,`about_us`,`our_products`,`our_services`,`contact_us`];

let currentPage = 1;
let activeUser: Employee | undefined;
let employees: Employee[] = [];
let companies: Company[] = [];
let filteredEmployees: Employee[] = [];

//employee data type definition
interface Employee {
    id?: number;
    fname: string;
    lname: string;
    photo: File | null;
    address: string;
    city: string;
    company_id: number;
    access_right: string;
    country: string;
    email: string;
    password?: string;
    company: string;
    color: string;
}

//company data type definition
interface Company {
    company_id: number;
    company: string;
    color: string;
}

//create the employee cards using data from databases
function createCards(arr1: Employee[]) {
    const cardContainer = document.getElementById('employee_cards') as HTMLElement;

    cardContainer.innerHTML = "";

    let startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    let endindex = startIndex + CARDS_PER_PAGE;

    const pageCards = arr1.slice(startIndex, endindex);


    if (!cardContainer) return;
    for (let emp of pageCards) {
        let card = document.createElement('div');
        card.className = 'card';
        if (!emp.id) return;
        card.id = emp.id.toString();
        card.dataset.companyId = emp.company_id.toString();

        let imageCard = document.createElement('div');
        imageCard.className = 'image_card';

        let image = document.createElement('img');
        if (!emp.photo) {
            image.src = '../img/default.jpeg'
        } else {
            image.src = emp.photo as unknown as string;
        }
        image.className = 'emp_image';

        let textName = document.createElement('p');
        textName.className = 'name_card';
        textName.textContent = `${emp.fname} ${emp.lname}`;

        cardContainer.appendChild(card);
        card.appendChild(textName);
        card.appendChild(imageCard);
        imageCard.appendChild(image);

        let companyName = document.createElement('p');
        companyName.textContent = emp.company;
        companyName.className = 'company_name';
        card.appendChild(companyName);
        let colorCard = document.createElement('div');
        colorCard.style.backgroundColor = emp.color;
        card.onclick = function () {
            createBigCard(emp);
        };

        colorCard.className = 'color_card';
        card.appendChild(colorCard);
        if (emp.email === userEmail)
            activeUser = emp;
    }

    updatePagination(arr1.length);
}

function updatePagination(totalItems: number) {
    const totalPages = Math.ceil(totalItems / CARDS_PER_PAGE);
    const cardContainer = document.getElementById('employee_cards') as HTMLElement;
    const prev = document.getElementById('prev_page') as HTMLButtonElement;
    const next = document.getElementById('next_page') as HTMLButtonElement;
    const pageInfo = document.getElementById('page_info') as HTMLElement;

    prev.onclick = () => {
        if (currentPage > 1) {
            cardContainer.innerHTML = '';
            currentPage--;
            createCards(filteredEmployees);
        }
    };

    next.onclick = () => {
        if (currentPage < totalPages) {
            cardContainer.innerHTML = '';
            currentPage++;
            createCards(filteredEmployees);
        }
    };

    pageInfo.innerHTML = `${currentPage}/${totalPages}`;

    prev.style.display = currentPage > 1 ? 'inline-block' : 'none';
    next.style.display = currentPage < totalPages ? 'inline-block' : 'none';
}

//create filter checkBox for each company
async function createCompaniesFilter() {
    let filter = document.getElementById('filter')

    for (let company of companies) {
        if (!filter) return;
        let label = document.createElement('label');
        let checkbox = document.createElement('input');
        checkbox.name = 'company';
        let breakline = document.createElement('br');

        checkbox.type = 'checkbox';
        checkbox.id = company.company_id.toString();
        label.htmlFor = checkbox.id;
        label.textContent = company.company;

        filter.appendChild(checkbox);
        filter.appendChild(label);
        filter.appendChild(breakline);
        filter.appendChild(breakline);
    }

}

function filterEmployees() {
    const checkboxes = document.querySelectorAll('input[name="company"]:checked') as NodeListOf<HTMLInputElement>;
    const selectedCompanyIds = Array.from(checkboxes).map(checkbox => parseInt(checkbox.id));

    if (selectedCompanyIds.length === 0) {
        filteredEmployees = employees;
    } else {
        filteredEmployees = employees.filter(emp => selectedCompanyIds.includes(emp.company_id));
    }

    currentPage = 1; // Reset to the first page after filtering
    createCards(filteredEmployees);
}

// create big employee card showing details
function createBigCard(emp: Employee) {
    let bigCard = document.getElementById('big_card') as HTMLElement;
    bigCard.style.display = `block`;
    bigCard.style.borderColor = emp.color;
    bigCard.innerHTML = ``;

    let imageCard = document.createElement('div');
    imageCard.className = 'big_image_card';

    let image = document.createElement('img');
    if (!emp.photo) {
        image.src = '../img/default.jpeg'
    } else {
        image.src = emp.photo as unknown as string;
    }
    image.className = 'big_emp_image';

    let textName = document.createElement('p');
    textName.className = 'big_name_card';
    textName.textContent = `${emp.fname} ${emp.lname}`;
    textName.style.color = emp.color;


    let companyName = document.createElement('p');
    companyName.innerHTML = `
        ${emp.company}<br><br><br>
        <b>Address: </b><br>
        ${emp.country}<br>
        ${emp.city}<br>
        ${emp.address}<br>                        
        `;
    companyName.className = 'big_company_name';

    let colorCard = document.createElement('div');
    colorCard.style.backgroundColor = emp.color;
    colorCard.className = 'big_color_card';

    let closeButton = document.createElement('button');
    closeButton.textContent = 'x';
    closeButton.className = 'close_button';
    closeButton.onclick = function () {
        bigCard.style.display = 'none';
    }

    let divButtons = document.createElement('div');
    divButtons.className = 'div_buttons';


    let shareButton = document.createElement('button');
    shareButton.textContent = 'Share';
    shareButton.className = 'big_card_buttons';

    let sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.className = 'big_card_buttons';
    sendButton.onclick = function () {
        window.open(`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(emp.email)}`);
    }


    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'big_card_buttons';
    deleteButton.style.color = 'red';
    deleteButton.onclick = function () {
        deleteEmployee(emp);
    }

    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'big_card_buttons';
    editButton.onclick = function () {
        addAndEditCard(emp);
    }

    bigCard.appendChild(closeButton);
    imageCard.appendChild(image);
    bigCard.appendChild(imageCard);
    bigCard.appendChild(textName);
    bigCard.appendChild(companyName);
    bigCard.appendChild(divButtons);
    if (activeUser && activeUser.access_right == accessRight[2]) {
        return;
    } else {
        divButtons.appendChild(shareButton);
        divButtons.appendChild(sendButton);
        if (activeUser?.access_right == accessRight[0]) {
            divButtons.appendChild(editButton);
            divButtons.appendChild(deleteButton);
        }
    }
    bigCard.appendChild(colorCard);
}
//create edit card and send the data using url to main.ts
function addAndEditCard(emp?: Employee) {
    const editCard = document.getElementById('new_employee') as HTMLElement;
    if (!editCard) return;

    editCard.style.display = 'block';
    editCard.style.borderColor = emp ? emp.color : '';

    const closeButton = document.getElementById('close_button') as HTMLButtonElement;
    if (closeButton) {
        closeButton.onclick = () => {
            editCard.style.display = 'none';
        };
    }

    const fnameInput = document.getElementById('fname') as HTMLInputElement;
    const lnameInput = document.getElementById('lname') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const addressInput = document.getElementById('address') as HTMLInputElement;
    const cityInput = document.getElementById('city') as HTMLInputElement;
    const countryInput = document.getElementById('country') as HTMLInputElement;
    const companyIdInput = document.getElementById('companyId') as HTMLInputElement;
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const passwordLabel = document.getElementById('password_label') as HTMLElement;
    const accessRightInput = document.getElementById('access_right') as HTMLInputElement;
    const accessRightLabel = document.getElementById('access_right_label') as HTMLElement;

    if (activeUser && activeUser?.access_right != accessRight[0]) {
        accessRightInput.style.display = 'none';
        accessRightLabel.style.display = 'none';
    }

    if (emp) {
        fnameInput.value = emp.fname;
        lnameInput.value = emp.lname;
        emailInput.value = emp.email;
        addressInput.value = emp.address;
        cityInput.value = emp.city;
        countryInput.value = emp.country;
        companyIdInput.value = emp.company_id.toString();
        accessRightInput.value = emp.access_right;
        if (emp.password)
            passwordInput.value = emp.password;
        passwordInput.style.display = 'block';

    } else {
        fnameInput.value = '';
        lnameInput.value = '';
        emailInput.value = '';
        addressInput.value = '';
        cityInput.value = '';
        countryInput.value = '';
        companyIdInput.value = '';
        accessRightInput.value = '';
        photoInput.value = '';
        passwordInput.style.display = 'none';
        passwordLabel.style.display = 'none';
    }


    const saveChangesButton = document.getElementById('save_changes') as HTMLButtonElement;
    saveChangesButton.onclick = async () => {
        const updatedEmployee: Employee = {
            ...emp,
            fname: capitalizeFirstLetter(fnameInput.value),
            lname: capitalizeFirstLetter(lnameInput.value),
            email: emailInput.value,
            address: addressInput.value,
            city: cityInput.value,
            country: countryInput.value,
            company_id: parseInt(companyIdInput.value),
            access_right: accessRightInput.value,
            photo: photoInput.files![0] || null,
            password: passwordInput.value,
            company: '',
            color: ''
        };

        const requiredFields = [fnameInput.value, lnameInput.value, emailInput.value, addressInput.value, cityInput.value, countryInput.value, companyIdInput.value, accessRightInput.value];
        const isValid = requiredFields.every(field => field !== '');

        if (!isValid) {
            alert('Please fill in all required fields!');
            return;
        }

        if (!validMail(emailInput.value)) {
            alert('Please enter a valid email address');
            return;
        }

        // edit employee
        if (emp) {
            const formData = new FormData();
            formData.append('employee', JSON.stringify(updatedEmployee));
            if (updatedEmployee.photo) {
                formData.append('image', updatedEmployee.photo);
            }
            const Url = `/empUpdated`;
            fetch(Url, {
                method: 'POST',
                body: formData
            });
            // add new employee 
        } else {
            const formData = new FormData();
            formData.append('employee', JSON.stringify(updatedEmployee));
            if (updatedEmployee.photo != null) {
                formData.append('image', updatedEmployee.photo);
            }
            const url = `/empNew`;

            try {
                const response = await fetch(url, { method: 'POST', body: formData });
                if (!response) throw new Error('response not ok!!');
                const data = await response.json();
                alert(data.message);
                console.log(data.message);

                //send the mail using url manually  
                const to = data.employee.email;
                const subject = `Welcom to Implify`;
                const body = `Dear ${updatedEmployee.fname} ${updatedEmployee.lname} you have successfuly registred,\n` +
                             `credentials:\nmail: ${updatedEmployee.email}\n` +
                             `password: ${data.employee.password}\n` +
                             `\nhttp://localhost:3000/`+
                             `\nRegards\nHR app`;
                const emailUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.open(emailUrl, '_blank');
            } catch (error) {
                console.log(`cannot fetch response`, error);
            }
        }
        editCard.style.display = 'none';
        location.reload();
    };
}



//send id to the main.ts to delete it
async function deleteEmployee(emp: Employee) {
    const confirmed = window.confirm(`Are you sure you want to delete ${emp.fname} ${emp.lname}?`);

    if (!confirmed) {
        return;
    }
    if (!emp.id) return;
    const url = `/empId?id=${encodeURIComponent(emp.id)}`;
    fetch(url);
    location.reload();
}

//get logged in user email
function getUser(): string | null {
    const emailJson = localStorage.getItem('userEmail');
    if (emailJson !== null) {
        const email = JSON.parse(emailJson);
        return email;
    } else {
        console.error('No user email found');
        return null;
    }
}

// select options for company
async function companySelect() {
    let companySelect = document.getElementById('companyId') as HTMLSelectElement;

    if (!companySelect) return;

    companySelect.innerHTML = '<option value="">Select a company</option>';
    for (let company of companies) {
        let option = document.createElement('option');
        option.value = company.company_id.toString();
        option.textContent = company.company;
        companySelect.appendChild(option);
    }
}

// Fetch all employee and company data
async function fetchAllData() {
    const addEmployee = document.getElementById('add_employee') as HTMLButtonElement;
    try {
        const [employeeResponse, companyResponse] = await Promise.all([
            fetch('http://localhost:3000/emp'),
            fetch('http://localhost:3000/comp')
        ]);

        if (!employeeResponse.ok || !companyResponse.ok) {
            throw new Error('Network response not ok');
        }

        employees = await employeeResponse.json();
        companies = await companyResponse.json();
        filteredEmployees = employees;
        createCards(filteredEmployees);
        createCompaniesFilter();
        companySelect();
        adduserData();
        if (activeUser && activeUser.access_right == accessRight[0]) {
            addEmployee.style.display = 'block';
        }
    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

//add user data(the one who logged in) 
function adduserData() {
    const userContainer = document.getElementById('user') as HTMLDivElement;
    const userImage = document.getElementById('profile_image') as HTMLImageElement;
    const bigUserImage = document.getElementById('big_profile_image') as HTMLImageElement;
    const userName = document.getElementById('user_name') as HTMLDivElement;
    const userDetails = document.getElementById('user_details') as HTMLDivElement;
    const closeButton = document.getElementById('close_user') as HTMLButtonElement;
    const signout = document.getElementById('signout') as HTMLButtonElement;
    const profileButton = document.getElementById('profile_button') as HTMLButtonElement;
    const editButton = document.getElementById('edit_profile') as HTMLButtonElement;


    if (activeUser) {
        userImage.src = activeUser.photo ? `${activeUser.photo}` : '../img/default.jpeg';
        bigUserImage.src = activeUser.photo ? `${activeUser.photo}` : '../img/default.jpeg';
        userName.innerHTML = `${activeUser?.fname} ${activeUser?.lname}`;
        userDetails.innerHTML = `${activeUser?.country}<br>${activeUser?.city}<br>${activeUser?.address}`;
        userContainer.style.borderColor = activeUser?.color;
    }

    profileButton.onclick = () => {
        userContainer.style.display = 'block';
    }

    closeButton.onclick = () => {
        userContainer.style.display = 'none';
    }

    signout.onclick = () => {
        location.href = '/';
    }

    if (activeUser?.access_right == accessRight[2]) {
        editButton.style.display = 'none';
    }

    editButton.onclick = () => {
        addAndEditCard(activeUser);
        userContainer.style.marginLeft = '10rem'
    }

}

function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function searchEmployees() {
    const searchTerm = (document.getElementById('search') as HTMLInputElement).value.toLowerCase();
    filteredEmployees = employees.filter(emp =>
        emp.fname.toLowerCase().includes(searchTerm) ||
        emp.lname.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; 
    createCards(filteredEmployees);
}

function validMail(email: string): boolean {
    if (email.includes('@') && email.includes('.'))
        return true;
    else return false;
}

function displayPages(activePage: string){
    for(let pageName of pageNames){
       let page  = document.getElementById(pageName) as HTMLDivElement;
       console.log(pageName+"_td")
       let td = document.getElementById(pageName+"_td") as HTMLElement;
       if(pageName == activePage){
        page.style.display ='contents';
       }else{
        page.style.display='none';

       }
    }  
}

function dropMenu(){
      const menu =  document.getElementById(`dropdown_content`) as HTMLElement
      console.log(menu.style.display)
      if(menu.style.display == 'none'){
        menu.style.display= 'block';
      }else{
        menu.style.display = 'none';
      }
}


document.addEventListener('DOMContentLoaded', () => {
    fetchAllData();
    document.getElementById('filter')?.addEventListener('change', filterEmployees);
    document.getElementById('search')?.addEventListener('input', searchEmployees);
});