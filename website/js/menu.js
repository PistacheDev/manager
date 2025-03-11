const menu = document.querySelector("nav.navbar img.hamburgerMenu");
const navLinks = document.querySelector("nav.navbar div.nav-links");

menu.addEventListener("click", () =>
{
    navLinks.classList.toggle("mobile-menu");
});