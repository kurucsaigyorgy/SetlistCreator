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

         const data = await response.json();
         console.log(data);
         
      } catch (error) {
         console.error('There has been a problem with your fetch operation:', error)
      }
   }
})