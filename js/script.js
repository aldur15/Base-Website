
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
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (!navToggle || !navMenu) return;

        // Toggle mobile menu
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
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
        if (!this.navbar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Hide/show navbar based on scroll direction
            if (scrollTop > this.lastScrollTop && scrollTop > 100) {
                // Scrolling down - hide navbar
                this.navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up - show navbar
                this.navbar.style.transform = 'translateY(0)';
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