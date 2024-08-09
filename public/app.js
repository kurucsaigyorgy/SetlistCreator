document.addEventListener('DOMContentLoaded', () => {
   // On page load, check if the user is logged in by verifying if there's an access token
   if (currentToken.access_token) {
      getUserData().then(userData => {
         renderTemplate('main', 'logged-in-template', userData);
         renderTemplate('oauth', 'oauth-template', currentToken);
      });
   } else {
      renderTemplate('main', 'login');
   }

   // Event listeners for buttons
   document.getElementById('login-button')?.addEventListener('click', loginWithSpotifyClick);
   document.getElementById('refresh-token-button')?.addEventListener('click', refreshTokenClick);
   document.getElementById('logout-button')?.addEventListener('click', logoutClick);
});

// Data structure that manages the current active token, caching it in localStorage
const currentToken = {
   get access_token() { return localStorage.getItem('access_token') || null; },
   get refresh_token() { return localStorage.getItem('refresh_token') || null; },
   get expires_in() { return localStorage.getItem('expires_in') || null; },
   get expires() { return localStorage.getItem('expires') || null; },

   save: function (response) {
      const { access_token, refresh_token, expires_in } = response;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('expires_in', expires_in);

      const now = new Date();
      const expiry = new Date(now.getTime() + (expires_in * 1000));
      localStorage.setItem('expires', expiry);
   }
};

// Function to handle login button click
function loginWithSpotifyClick() {
   const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   const randomValues = crypto.getRandomValues(new Uint8Array(64));
   const randomString = randomValues.reduce((acc, x) => acc + possible[x % possible.length], "");

   const code_verifier = randomString;
   const data = new TextEncoder().encode(code_verifier);
   crypto.subtle.digest('SHA-256', data).then(hashed => {
      const code_challenge_base64 = btoa(String.fromCharCode(...new Uint8Array(hashed)))
         .replace(/=/g, '')
         .replace(/\+/g, '-')
         .replace(/\//g, '_');

      localStorage.setItem('code_verifier', code_verifier);

      // Redirect to the server-side endpoint which will handle the OAuth2 PKCE authorization flow
      window.location.href = `/login?code_challenge=${code_challenge_base64}`;
   });
}

// Function to handle logout button click
function logoutClick() {
   localStorage.clear();
   window.location.href = '/';
}

// Function to handle token refresh button click
async function refreshTokenClick() {
   const response = await fetch('/refresh-token', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: currentToken.refresh_token }),
   }).then(res => res.json());

   currentToken.save(response);
   renderTemplate('oauth', 'oauth-template', currentToken);
}

// Function to fetch user data from Spotify
async function getUserData() {
   const response = await fetch('/me', {
      method: 'GET',
      headers: {
         'Authorization': `Bearer ${currentToken.access_token}`,
      },
   });

   if (response.status === 401) {
      await refreshTokenClick(); // Automatically refresh token if access token is expired
      return getUserData(); // Retry fetching user data after refreshing token
   }

   return response.json();
}

// HTML Template Rendering with basic data binding - demoware only.
function renderTemplate(targetId, templateId, data = null) {
   const template = document.getElementById(templateId);
   const clone = template.content.cloneNode(true);

   const elements = clone.querySelectorAll("*");
   elements.forEach(ele => {
      const bindingAttrs = [...ele.attributes].filter(a => a.name.startsWith("data-bind"));

      bindingAttrs.forEach(attr => {
         const target = attr.name.replace(/data-bind-/, "").replace(/data-bind/, "");
         const targetType = target.startsWith("onclick") ? "HANDLER" : "PROPERTY";
         const targetProp = target === "" ? "innerHTML" : target;

         const prefix = targetType === "PROPERTY" ? "data." : "";
         const expression = prefix + attr.value.replace(/;\n\r\n/g, "");

         // Maybe use a framework with more validation here ;)
         try {
            ele[targetProp] = targetType === "PROPERTY" ? eval(expression) : () => { eval(expression) };
            ele.removeAttribute(attr.name);
         } catch (ex) {
            console.error(`Error binding ${expression} to ${targetProp}`, ex);
         }
      });
   });

   const target = document.getElementById(targetId);
   target.innerHTML = "";
   target.appendChild(clone);
}