document.addEventListener('DOMContentLoaded', async () => {
   const userData = await fetchUserData();
   console.log(userData);
   
   createAboutMePage(userData.body);
});

async function fetchUserData() {
   try {
      const response = await fetch('/api/me');
      if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data = await response.json();
      return data;

   } catch (error) {
      console.error('Error fetching data', error);
   }
};

function createAboutMePage(data) {
   const container = document.getElementById('about-me-container');
   createHTMLElement('div', 'User name: ', data.display_name, container, 'user-name');
   createHTMLElement('div', 'Country: ', data.country, container, 'country');
   createHTMLElement('div', 'Email: ', data.email, container, 'email');
   createHTMLElement('div', 'User Account Link: ', data.external_urls.spotify, container, 'account-link');
   createHTMLElement('div', 'ID: ', data.id, container, 'id');
   createHTMLElement('div', 'Total Number of Followers: ', data.followers.total, container, 'followers');
   createHTMLElement('button', '', 'Go Back', container, 'back-button');
   const backBtn = document.getElementById('back-button');
   backBtn.addEventListener('click', () => {
      history.back();
   });
}

function createHTMLElement(elementType, tag, content, container, id) {
   const htmlElement = document.createElement(elementType);
   const htmlContent = document.createTextNode(`${tag}${content}`);
   htmlElement.id = id;
   htmlElement.appendChild(htmlContent);
   container.appendChild(htmlElement);
}

