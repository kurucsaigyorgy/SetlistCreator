document.addEventListener('DOMContentLoaded', () => {

   const form = document.getElementById('search-form');
   const userInput = document.getElementById('search-field');
   const results = document.getElementById('search-result-container');

   form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const searchValue = userInput.value;

      try {
         const response = await fetch(`/search?query=${searchValue}`);

         if (!response.ok) {
            throw new Error('Network response was not ok.')
         }

         const data = await response.json();

         console.log(data);
         renderGrid(data, results);

      } catch (error) {
         console.error('There has been a problem with your fetch operation:', error);
      }
   });
});

function renderGrid(data, results) {
   results.innerText = "";

   const artists = data.artists.items;
   console.log(artists);

   for (let i = 0; i < artists.length; i++) {

      const artist = artists[i];

      const gridElement = document.createElement('div');
      gridElement.id = `grid-${i}`
      results.appendChild(gridElement);

      const image = artist.images[2]?.url || "";
      const uri = artist.external_urls.spotify;
      const name = artist.name;
      const followers = artist.followers.total;
      const genres = artist.genres.join(', ');
      const popularity = artist.popularity;

      createGridContent(gridElement, i, 'img', 'image', 'Picture: ', '', image);
      createGridContent(gridElement, i, 'div', 'name', 'Artist name: ', name), '';
      createGridContent(gridElement, i, 'a', 'link', '', uri, uri);
      createGridContent(gridElement, i, 'div', 'followers', 'Total followers: ', followers, "");
      createGridContent(gridElement, i, 'div', 'genres', 'Genres: ', genres, "");
      createGridContent(gridElement, i, 'div', 'popularity', 'Popularity: ', popularity, "");
      createGridContent(gridElement, i, 'button', 'select-btn', '', 'Select artist', "");
   }
}

function createGridContent(parent, index, type, id, label, content, source) {
   const element = document.createElement(type);
   element.id = `${id}-${index}`;
   parent.appendChild(element);

   if (content) {
      element.textContent = label + `${content}`;
   }

   if (source) {
      element.href = source;
      element.src = source;
   }
}
