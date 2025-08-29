// Dark Mode Toggle Implementation
document.addEventListener('DOMContentLoaded', function() {
	const themeToggle = document.getElementById('theme-toggle');
	const body = document.body;
	const moonIcon = themeToggle.querySelector('.moon-icon');
	const sunIcon = themeToggle.querySelector('.sun-icon');

	// Check for saved theme preference or default to light mode
	const savedTheme = localStorage.getItem('theme');
	const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

	// Set initial theme
	if (savedTheme) {
		setTheme(savedTheme);
	} else if (systemPrefersDark) {
		setTheme('dark');
	} else {
		setTheme('light');
	}

	// Theme toggle click handler
	themeToggle.addEventListener('click', function() {
		const currentTheme = body.getAttribute('data-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		setTheme(newTheme);
		localStorage.setItem('theme', newTheme);
	});

	// Function to set theme
	function setTheme(theme) {
		body.setAttribute('data-theme', theme);

		// Dispatch custom event for Three.js to listen to
		document.dispatchEvent(new CustomEvent('darkModeToggle', {
			detail: {
				theme
			}
		}));

		if (theme === 'dark') {
			moonIcon.style.display = 'none';
			sunIcon.style.display = 'block';
			themeToggle.setAttribute('aria-label', 'Switch to light mode');
		} else {
			moonIcon.style.display = 'block';
			sunIcon.style.display = 'none';
			themeToggle.setAttribute('aria-label', 'Switch to dark mode');
		}
	}

	// Listen for system theme changes
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
		if (!localStorage.getItem('theme')) {
			setTheme(e.matches ? 'dark' : 'light');
		}
	});

	// Mobile navigation toggle (if you need this functionality)
	const navToggle = document.getElementById('nav-toggle');
	const navMenu = document.getElementById('nav-menu');

	if (navToggle && navMenu) {
		navToggle.addEventListener('click', function() {
			navMenu.classList.toggle('active');
			navToggle.classList.toggle('active');
		});

		// Close menu when clicking on a link
		document.querySelectorAll('.nav-link').forEach(link => {
			link.addEventListener('click', function() {
				navMenu.classList.remove('active');
				navToggle.classList.remove('active');
			});
		});
	}
});