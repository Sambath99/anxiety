document.addEventListener('DOMContentLoaded', function() {
    // Add ripple effect to cards
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            this.style.transform = 'translateY(-8px)';
        });

        card.addEventListener('mouseleave', function(e) {
            this.style.transform = 'translateY(0)';
        });

        card.addEventListener('click', function(e) {
            let ripple = document.createElement('div');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add greeting based on time of day
    const adminName = document.querySelector('.admin-name');
    const hour = new Date().getHours();
    let greeting = 'Welcome back';
    
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 18) {
        greeting = 'Good afternoon';
    } else {
        greeting = 'Good evening';
    }
    
    document.querySelector('h1').innerHTML = `${greeting}, <span class="admin-name">Isaac</span>`;
});
document.onkeydown = (e) => {
    if (e.key == 123) {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.key == 'I') {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.key == 'C') {
        e.preventDefault();
    }
    if (e.ctrlKey && e.shiftKey && e.key == 'J') {
        e.preventDefault();
    }
    if (e.ctrlKey && e.key == 'U') {
        e.preventDefault();
    }
    if (e.key == 'F12') {
        e.preventDefault();
    }
};