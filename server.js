
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const PORT = process.env.PORT;
const setlistAPIKey = process.env.SETLIST_API_KEY;

const spotifyAPISearchRoot = 'https://api.spotify.com/v1/search';
const spotifyAPIUsersRoute = 'https://api.spotify.com/v1/users';
const spotifyAPIPlaylistRoute = 'https://api.spotify.com/v1/playlists';
const musicBrainsAPIRoot = 'https://musicbrainz.org/ws/2/';
const setlistAPIArtistRoot = 'https://api.setlist.fm/rest/1.0/artist/';
const setlistAPISetlistRoot = 'https://api.setlist.fm/rest/1.0/setlist/';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
];

const spotifyApi = new SpotifyWebApi({
    redirectUri: `http://localhost:${PORT}/callback`,
    clientId: clientId,
    clientSecret: clientSecret,
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/logged-in', (req, res) => {
    res.render('logged_in');
});

app.get('/api/me', async (req, res) => {
    const me = await spotifyApi.getMe();
    res.send(me);
});

app.get('/me', (req, res) => {
    res.render('me');
});

app.get('/search', (req, res) => {
    res.render('search_page');
});

app.get('/api/search', async (req, res) => {
    const query = req.query.query
    const accessToken = req.cookies.token;

    try {
        const response = await fetch(`${spotifyAPISearchRoot}?q=${query}&type=artist&limit=10&market=HU&offset=0`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })

        if (!response.ok) {
            throw new Error('External API response was not ok.')
        }

        const data = await response.json();
        res.send(data);

    } catch (error) {
        console.error('Error fetching data from external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/setlists', (req, res) => {
    res.render('setlists');
});

app.get('/api/setlists', async (req, res) => {
    const artistMBID = req.query.mbid;

    try {
        const response = await fetch(`${setlistAPIArtistRoot}${artistMBID}/setlists?&page=1`, {
            headers: {
                'x-api-key': `${setlistAPIKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('External API response was not ok.')
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching data from external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/setlist-details', (req, res) => {
    res.render('setlist_details');
});

app.get('/api/setlist-details', async (req, res) => {
    const setlistMBID = req.query.setlistmbid;

    try {
        const response = await fetch(`${setlistAPISetlistRoot}${setlistMBID}`, {
            headers: {
                'x-api-key': `${setlistAPIKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('External API response was not ok.')
        }

        const data = await response.json();
        res.send(data);

    } catch (error) {
        console.error('Error fetching data from external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/api/mbid', async (req, res) => {
    const artist = req.query.artist;

    try {
        const query = `artist:${artist}`;
        const response = await fetch(`${musicBrainsAPIRoot}artist/?query=${query}&limit=1&fmt=json`, {
            method: 'GET',
            headers: {
                'User-Agent': 'SetList Creator/1.0 (kurucsai.gyorgy@gmail.com)',
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('External API response was not ok.')
        }

        const data = await response.json();
        const mbid = data.artists[0].id;
        res.json(mbid);

    } catch (error) {
        console.error('Error fetching data from external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/api/create-playlist', async (req, res) => {
    const id = req.query.id;
    const name = req.query.title;
    const accessToken = req.cookies.token;

    try {
        const response = await fetch(`${spotifyAPIUsersRoute}/${id}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'name': `${name}`,
                'description': `Songs of the event: ${name}`,
                'public': false,
            })
        });

        if (!response.ok) {
            throw new Error('External API response was not ok.')
        }

        const data = await response.json();
        const playlistID = data.id;
        res.json(playlistID);

    } catch (error) {
        console.error('Error fetching data from external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/api/find-song-id', async (req, res) => {
    const songName = req.query.songName;
    const artist = req.query.artist;
    const query = `track:${songName} artist:${artist}`;
    const accessToken = req.cookies.token;

    try {
        const response = await fetch(`${spotifyAPISearchRoot}?query=${query}&type=track&limit=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('External API response was not ok.')
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching data from external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.post('/api/add-songs-to-playlist', async (req, res) => {
    const trackUri = req.query.uri;
    const playlistID = req.query.playlistID;
    const accessToken = req.cookies.token;

    try {
        const response = await fetch(`${spotifyAPIPlaylistRoute}/${playlistID}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [trackUri]
            })
        });

        if (!response.ok) {
            throw new Error('External API response was not ok.')
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Error fetching data from external API', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.error('Callback Error:', error);
        res.send(`Callback Error: ${error}`);
        return;
    }

    spotifyApi
        .authorizationCodeGrant(code)
        .then(data => {
            const access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];

            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);
            
            const options = {
                httpOnly: true,
                // expires: new Date(Date.now() + process.env.EXPIRE_TOKEN),
            }

            setTokenInCookies(access_token, res, options);

            console.log('access_token:', access_token);
            console.log('refresh_token:', refresh_token);

            console.log(`Sucessfully retreived access token. Expires in ${expires_in} s.`);

            setInterval(async () => {
                const data = await spotifyApi.refreshAccessToken();
                const access_token = data.body['access_token'];

                console.log('The access token has been refreshed!');
                console.log('access_token:', access_token);
                spotifyApi.setAccessToken(access_token);
                setTokenInCookies(access_token, res, options);
            }, expires_in / 2 * 1000);

            res.redirect('/logged-in');
        })
        .catch(error => {
            console.error('Error getting Tokens:', error);
            res.send(`Error getting Tokens: ${error}`);
        });
});

const setTokenInCookies = (token, res, options) => {
    res
    .status(200)
    .cookie('token', token, options);
}

app.listen(8080, () =>
    console.log(
        `HTTP Server up. Now go to http://localhost:${PORT}/ in your browser.`
    )
);

