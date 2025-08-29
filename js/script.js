class PortfolioManager {
    constructor() {
        this.lastScrollTop = 0;
        this.navbar = document.querySelector('.navbar');
        this.init();
    }

    init() {
        this.initMobileNavigation();
        this.initSmoothScrolling();
        this.initScrollEffects();
        this.initAnimations();
        this.initInteractiveElements();
    }

    initMobileNavigation() {
    console.log('Initializing mobile navigation...');
    
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileClose = document.getElementById('mobile-close');
    
    if (!navToggle || !mobileMenu || !mobileMenuOverlay) {
        console.error('Mobile navigation elements not found!');
        return;
    }

    

    // Open mobile menu
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openMobileMenu();
    });

    // Close mobile menu via close button
    if (mobileClose) {
        mobileClose.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeMobileMenu();
        });
    }

    // Close mobile menu via overlay
    mobileMenuOverlay.addEventListener('click', () => {
        this.closeMobileMenu();
    });

    // Close mobile menu when clicking on navigation links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            this.closeMobileMenu();
        });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            this.closeMobileMenu();
        }
    });

    
}

openMobileMenu() {
    console.log('Opening mobile menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const navToggle = document.getElementById('nav-toggle');
    
    mobileMenu.classList.add('active');
    mobileMenuOverlay.classList.add('active');
    navToggle.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
}

closeMobileMenu() {
    console.log('Closing mobile menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const navToggle = document.getElementById('nav-toggle');
    
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    navToggle.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scroll
}
toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    console.log('Theme changed to:', newTheme);
}


initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', currentTheme);

    // Desktop theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });
    }

    // Mobile theme toggle
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });
    }
}

    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initScrollEffects() {
        // Removed the navbar hide/show functionality
        // The navbar will now scroll naturally with the page
        
        // You can add other scroll effects here if needed
        // For example, changing navbar background opacity based on scroll position:
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Optional: Add background blur/opacity effect when scrolling
            if (this.navbar) {
                if (scrollTop > 50) {
                    this.navbar.classList.add('scrolled');
                } else {
                    this.navbar.classList.remove('scrolled');
                }
            }
            
            this.lastScrollTop = Math.max(0, scrollTop);
        });
    }

    initAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Setup elements for animation
        const animatedElements = document.querySelectorAll('.skill-category, .link-card, .about-content');
        
        animatedElements.forEach(element => {
            // Set initial animation state
            Object.assign(element.style, {
                opacity: '0',
                transform: 'translateY(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease'
            });
            
            observer.observe(element);
        });
    }

    initInteractiveElements() {
        // Add click feedback for buttons and interactive elements
        const interactiveElements = document.querySelectorAll('.btn, .theme-toggle, .nav-toggle');
        
        interactiveElements.forEach(element => {
            // Mouse down effect
            element.addEventListener('mousedown', () => {
                element.style.transform = 'scale(0.95)';
            });

            // Mouse up effect
            element.addEventListener('mouseup', () => {
                element.style.transform = 'scale(1)';
            });

            // Reset on mouse leave
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PortfolioManager();
});


// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}