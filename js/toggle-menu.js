// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileClose = document.getElementById('mobile-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Function to open mobile menu
  function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
  }

  // Function to close mobile menu
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Toggle menu when hamburger is clicked
  if (navToggle) {
    navToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close menu when close button is clicked
  if (mobileClose) {
    mobileClose.addEventListener('click', function(e) {
      e.stopPropagation();
      closeMobileMenu();
    });
  }

  // Close menu when overlay is clicked
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', function() {
      closeMobileMenu();
    });
  }

  // Close menu when a navigation link is clicked
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', function() {
      closeMobileMenu();
    });
  });

  // Close menu when Escape key is pressed
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Prevent clicks inside the menu from closing it
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
});