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
         const setList =  await fetchSetLists(mbid);
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
   
   setlist.forEach(set => {
      const setlistItem = document.createElement('div');
      setlistItem.textContent = `${set.venue.city.name} - ${set.venue.name} - ${set.eventDate}`;
      container.appendChild(setlistItem);
      
   });


}