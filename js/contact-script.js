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
            
            // For demo purposes - in real implementation, you'd send to your backend
            alert('Thank you for your message! I\'ll get back to you soon.');


            //UNBEDINGT FUNKTIONIERENDES SYSTEM EINBAUEN
            this.reset();
        });