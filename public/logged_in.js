const aboutMeBtn = document.getElementById('about-me');
aboutMeBtn.addEventListener("click", () => {
   redirect('http://localhost:8080/me');
});
const searchBtn = document.getElementById('search');
searchBtn.addEventListener("click", () => {
   redirect('http://localhost:8080/search');
});

function redirect(URI) {
   location.href = URI;
}