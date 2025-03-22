document.addEventListener('DOMContentLoaded', () => {
    console.log('Welcome to the Pet Adoption Website!');
  });
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});
