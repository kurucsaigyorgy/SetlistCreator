document.addEventListener('DOMContentLoaded', async () => {
   const params = new URLSearchParams(window.location.search);
   const setlistID = params.get('setlistmbid');
   const city = params.get('city');
   const venue = params.get('venue');
   const date = params.get('date');

   const title = document.getElementById('title');
   title.textContent = `${city} - ${venue} - ${date}`;

   const setlist = await fetchSetlistDetails(setlistID);
   console.log(setlist);
   renderSongs(setlist);
});

const fetchSetlistDetails = async (setlistmbid) => {
   try {
      const response = await fetch(`/api/setlist-details?setlistmbid=${setlistmbid}`);

      if (!response.ok) {
         throw new Error('Network response was not ok.');
      }

      const data = await response.json();
      return data;

   } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
   }
}

const renderSongs = (setlist) => {
   const songs = setlist.sets.set[0].song;
   const container = document.getElementById('container');

   for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const songDiv = document.createElement('div');
      songDiv.textContent = `${i + 1}. ${song.name}`;
      container.appendChild(songDiv);
   }
};