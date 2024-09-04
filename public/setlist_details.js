document.addEventListener('DOMContentLoaded', async () => {
   const params = new URLSearchParams(window.location.search);
   const setlistID = params.get('setlistmbid');
   const city = params.get('city');
   const venue = params.get('venue');
   const date = params.get('date');
   const artist = params.get('artist');
   const titleText = `${city} - ${venue} - ${date}`;
   const playlistTitle = `${artist} - ${titleText}`;

   const title = document.getElementById('title');
   title.textContent = `${titleText}`;

   const setlist = await fetchSetlistDetails(setlistID);
   renderSongs(setlist);

   const createPlaylistBtn = document.getElementById('create-playlist');
   createPlaylistBtn.addEventListener('click', () => {
      createSpotifyPlaylist(setlist, playlistTitle);
   })
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
      songDiv.id = `song-${i + 1}`;
      songDiv.textContent = `${i + 1}. ${song.name}`;
      container.appendChild(songDiv);
   }
};

const createSpotifyPlaylist = async (setlist, title) => {
   const me = await fetchUserID();
   const id = me.body.id;

   const response = await fetch(`/api/create-playlist?id=${id}&title=${title}`, {
      method: 'POST',
   });

   const playlistID = await response.json();
   const songURIs = await findSpotifySongIDs(setlist);
   console.log(songURIs);
   
   addSongsToPlaylist(songURIs, playlistID);
};

const fetchUserID = async () => {
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
}

const findSpotifySongIDs = async (setlist) => {
   let spotifySongURIArray = [];

   const songs = setlist.sets.set[0].song;
   const artist = setlist.artist.name;

   for (const song of songs) {
      if (!song.name) { return }

      const response = await fetch(`/api/find-song-id?songName=${song.name}&artist=${artist}`);
      const data = await response.json();

      if (data.tracks.items.length === 0) { continue };
      const uri = `spotify:track:${data.tracks.items[0].id}`;
      spotifySongURIArray.push(uri);
   };

   return spotifySongURIArray;
};

const addSongsToPlaylist = async (songURIArray, playlistID) => {
   songURIArray.forEach( async uri => {
      const response = await fetch(`/api/add-songs-to-playlist?uri=${uri}&playlistID=${playlistID}`, {
         method: 'POST',
      });
      const data = await response.json();
      console.log(data);
      
   });
   
};