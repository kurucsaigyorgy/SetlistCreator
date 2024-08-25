const aboutMeBtn = document.getElementById('about-me');
aboutMeBtn.addEventListener("click", () => {
   redirect('http://localhost:8080/me');
});
const searchBtn = document.getElementById('search');
searchArtistBtn.addEventListener("click", () => {
   redirect('http://localhost:8080/search-page');
});

function redirect(URI) {
   location.href = URI;
}