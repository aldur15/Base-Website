document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !subject || !message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Create mailto link
    const mailtoLink = `mailto:alexander1996may@proton.me?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    // Open user's email client
    window.location.href = mailtoLink;
    
    // Reset form
    this.reset();
});