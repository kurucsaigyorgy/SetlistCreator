document.addEventListener('DOMContentLoaded', () => {

   const form = document.getElementById('search-form');
   const userInput = document.getElementById('search-field');

   form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const searchValue = userInput.value;
      console.log(searchValue);


      try {
         const response = await fetch(`/search?query=${searchValue}`);

         if (!response.ok) {
            throw new Error('Network response was not ok.')
         }

         const data = await response.json();
         console.log(data);

      } catch (error) {
         console.error('There has been a problem with your fetch operation:', error);
      }
   });

});