document.addEventListener('DOMContentLoaded', async () => {
   const params = new URLSearchParams(window.location.search);
   const artistName = params.get('artist');
   console.log(artistName);


   if (artistName) {
      document.getElementById('artist-name').textContent = artistName;

      try {
         const response = await fetch(`/api/mbid?artist=${artistName}`);

         if (!response.ok) {
            throw new Error('Network response was not ok.')
         }

         const mbid = await response.json();
         const setList = await fetchSetLists(mbid);
         console.log(setList);
         renderSetlists(setList);

      } catch (error) {
         console.error('There has been a problem with your fetch operation:', error)
      }
   }
});

const fetchSetLists = async (mbid) => {
   try {
      const response = await fetch(`/api/setlists?mbid=${mbid}`);

      if (!response.ok) {
         throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      return data;
   } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
   }
}

const renderSetlists = (data) => {
   const setlist = data.setlist;
   const container = document.getElementById('setlist-container');

   for (let i = 0; i < setlist.length; i++) {
      const set = setlist[i];
      const setlistID = set.id;
      const city = set.venue.city.name;
      const venue = set.venue.name;
      const date = set.eventDate;
      const artist = set.artist.name;

      const setlistDiv = document.createElement('div');
      setlistDiv.textContent = `${i + 1}. ${city} - ${venue} - ${date}`;
      setlistDiv.id = `setlist-item-${i}`;
      setlistDiv.classList.add('setlist-item');
      container.appendChild(setlistDiv);

      setlistDiv.addEventListener('click', (event) => {
            location.href = `http://localhost:8080/setlist-details?setlistmbid=${setlistID}&artist=${artist}&city=${city}&venue=${venue}&date=${date}`;
      });

   }
}