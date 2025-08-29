// contact.js - Updated for PHP backend
document.addEventListener('DOMContentLoaded', function() {
	const contactForm = document.getElementById('contact-form');
	const submitButton = contactForm.querySelector('.form-submit');
	const originalButtonText = submitButton.textContent;

	// Form validation
	function validateForm(formData) {
		const errors = [];

		if (!formData.name.trim()) {
			errors.push('Name is required');
		}

		if (!formData.email.trim()) {
			errors.push('Email is required');
		} else if (!isValidEmail(formData.email)) {
			errors.push('Please enter a valid email address');
		}

		if (!formData.subject.trim()) {
			errors.push('Subject is required');
		}

		if (!formData.message.trim()) {
			errors.push('Message is required');
		}

		return errors;
	}

	function isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Update button state
	function setButtonState(isLoading) {
		if (isLoading) {
			submitButton.disabled = true;
			submitButton.textContent = 'Sending...';
			submitButton.classList.add('loading');
		} else {
			submitButton.disabled = false;
			submitButton.textContent = originalButtonText;
			submitButton.classList.remove('loading');
		}
	}

	// Show notification
	function showNotification(message, type = 'info') {
		// Remove existing notifications
		const existingNotification = document.querySelector('.notification');
		if (existingNotification) {
			existingNotification.remove();
		}

		// Create notification element
		const notification = document.createElement('div');
		notification.className = `notification notification-${type}`;
		notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

		// Add styles if not already present
		if (!document.querySelector('#notification-styles')) {
			const styles = document.createElement('style');
			styles.id = 'notification-styles';
			styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    padding: 1rem 1.25rem;
                    border-radius: 12px;
                    color: white;
                    font-weight: 500;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-success {
                    background: linear-gradient(135deg, #10b981, #059669);
                }
                
                .notification-error {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }
                
                .notification-info {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    margin-left: 1rem;
                    padding: 0;
                    line-height: 1;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                @media (max-width: 480px) {
                    .notification {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
			document.head.appendChild(styles);
		}

		// Add to page
		document.body.appendChild(notification);

		// Show notification
		setTimeout(() => notification.classList.add('show'), 100);

		// Auto hide after 5 seconds
		const hideTimeout = setTimeout(() => {
			hideNotification(notification);
		}, 5000);

		// Close button functionality
		const closeBtn = notification.querySelector('.notification-close');
		closeBtn.addEventListener('click', () => {
			clearTimeout(hideTimeout);
			hideNotification(notification);
		});

		return notification;
	}

	function hideNotification(notification) {
		notification.classList.remove('show');
		setTimeout(() => {
			if (notification.parentNode) {
				notification.remove();
			}
		}, 300);
	}

	// Handle form submission
	contactForm.addEventListener('submit', async function(e) {
		e.preventDefault();

		// Get form data
		const formData = {
			name: document.getElementById('name').value,
			email: document.getElementById('email').value,
			subject: document.getElementById('subject').value,
			message: document.getElementById('message').value
		};

		// Validate form
		const errors = validateForm(formData);
		if (errors.length > 0) {
			showNotification(errors.join(', '), 'error');
			return;
		}

		// Set loading state
		setButtonState(true);

		try {
			// Send to PHP backend
			const response = await fetch('contact_handler.php', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (result.success) {
				// Success
				showNotification(result.message, 'success');
				contactForm.reset();

				// Optional: Add success animation to form
				contactForm.style.transform = 'scale(0.98)';
				setTimeout(() => {
					contactForm.style.transform = 'scale(1)';
				}, 200);

			} else {
				// Error from server
				showNotification(result.message, 'error');
			}

		} catch (error) {
			console.error('Error sending message:', error);
			showNotification('Network error. Please check your connection and try again.', 'error');
		} finally {
			// Reset button state
			setButtonState(false);
		}
	});

	// Real-time validation feedback
	const inputs = contactForm.querySelectorAll('input, textarea');
	inputs.forEach(input => {
		input.addEventListener('blur', function() {
			validateField(this);
		});

		input.addEventListener('input', function() {
			// Clear error state on input
			this.classList.remove('error');
			const errorElement = this.parentNode.querySelector('.field-error');
			if (errorElement) {
				errorElement.remove();
			}
		});
	});

	function validateField(field) {
		const value = field.value.trim();
		let errorMessage = '';

		switch (field.id) {
			case 'name':
				if (!value) errorMessage = 'Name is required';
				else if (value.length > 100) errorMessage = 'Name must be less than 100 characters';
				break;
			case 'email':
				if (!value) errorMessage = 'Email is required';
				else if (!isValidEmail(value)) errorMessage = 'Please enter a valid email address';
				break;
			case 'subject':
				if (!value) errorMessage = 'Subject is required';
				else if (value.length > 200) errorMessage = 'Subject must be less than 200 characters';
				break;
			case 'message':
				if (!value) errorMessage = 'Message is required';
				else if (value.length > 2000) errorMessage = 'Message must be less than 2000 characters';
				break;
		}

		// Remove existing error
		const existingError = field.parentNode.querySelector('.field-error');
		if (existingError) {
			existingError.remove();
		}
		field.classList.remove('error');

		// Add error if needed
		if (errorMessage) {
			field.classList.add('error');
			const errorElement = document.createElement('div');
			errorElement.className = 'field-error';
			errorElement.textContent = errorMessage;
			field.parentNode.appendChild(errorElement);

			// Add error styles if not present
			if (!document.querySelector('#field-error-styles')) {
				const styles = document.createElement('style');
				styles.id = 'field-error-styles';
				styles.textContent = `
                    .form-group input.error,
                    .form-group textarea.error {
                        border: 2px solid #ef4444;
                        box-shadow: inset 4px 4px 8px var(--shadow-dark), 
                                   inset -4px -4px 8px var(--shadow-light),
                                   0 0 0 3px rgba(239, 68, 68, 0.2);
                    }
                    
                    .field-error {
                        color: #ef4444;
                        font-size: 0.875rem;
                        margin-top: 0.5rem;
                        font-weight: 500;
                    }
                    
                    .loading {
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .loading::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                        animation: loading-shimmer 1.5s infinite;
                    }
                    
                    @keyframes loading-shimmer {
                        0% { left: -100%; }
                        100% { left: 100%; }
                    }
                `;
				document.head.appendChild(styles);
			}
		}
	}

	// Character counters for textarea and subject
	const subjectField = document.getElementById('subject');
	const messageField = document.getElementById('message');

	function addCharacterCounter(field, maxLength) {
		const counter = document.createElement('div');
		counter.className = 'character-counter';
		counter.textContent = `0/${maxLength}`;
		field.parentNode.appendChild(counter);

		field.addEventListener('input', function() {
			const currentLength = this.value.length;
			counter.textContent = `${currentLength}/${maxLength}`;

			if (currentLength > maxLength * 0.9) {
				counter.style.color = '#ef4444';
			} else if (currentLength > maxLength * 0.8) {
				counter.style.color = '#f59e0b';
			} else {
				counter.style.color = 'var(--text-light)';
			}
		});

		// Add counter styles
		if (!document.querySelector('#counter-styles')) {
			const styles = document.createElement('style');
			styles.id = 'counter-styles';
			styles.textContent = `
                .character-counter {
                    font-size: 0.75rem;
                    color: var(--text-light);
                    margin-top: 0.25rem;
                    text-align: right;
                    transition: color 0.3s ease;
                }
            `;
			document.head.appendChild(styles);
		}
	}

	addCharacterCounter(subjectField, 200);
	addCharacterCounter(messageField, 2000);
});