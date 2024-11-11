// Initialize EmailJS
(function() {
    emailjs.init("Du3lYdEFe4AAaU540");
})();

// JSONBin.io configuration
const JSONBIN_API_KEY = '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC'; // Replace with your API key
const JSONBIN_BIN_ID = '6730c801ad19ca34f8c785b1'; // Replace with the new bin ID
const SHOP_STATUS_BIN_ID = '6730c539acd3cb34a8a60032'; // Replace with your bin ID for shop status

// Function to check shop status
async function checkShopStatus() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${SHOP_STATUS_BIN_ID}`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const data = await response.json();
        const shopStatus = data.record.shop_status;
        
        if (shopStatus === 1) {
            // Hide content immediately
            document.body.style.display = 'none';
            // Redirect to main shop
            window.location.href = 'https://sambath99.github.io/anxiety/';
        } else {
            // Show content if status is 0
            document.body.style.visibility = 'visible';
        }
        
        return shopStatus;
    } catch (error) {
        console.error('Shop Status Check Error:', error);
        // Show content in case of error
        document.body.style.visibility = 'visible';
        return 0;
    }
}

// Function to save email to JSONBin
async function saveEmailToJSONBin(email) {
    try {
        // First, get current emails
        const getResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!getResponse.ok) {
            console.error('Get Response Error:', await getResponse.text());
            throw new Error('Failed to fetch emails');
        }

        const data = await getResponse.json();
        console.log('Current data:', data); // Debug log

        let emails = data.record.emails || [];
        console.log('Current emails:', emails); // Debug log
        
        // Add new email if it doesn't exist
        if (!emails.includes(email)) {
            emails.push(email);
            console.log('Updated emails array:', emails); // Debug log
            
            // Update the bin with new email
            const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY,
                    'X-Bin-Versioning': false
                },
                body: JSON.stringify({
                    "emails": emails
                })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                console.error('Update Response Error:', errorText);
                throw new Error('Failed to update emails');
            }

            const updateData = await updateResponse.json();
            console.log('Update response:', updateData); // Debug log
            console.log('Email saved successfully:', email);
            
            // Verify the update
            await checkCurrentEmails();
        } else {
            console.log('Email already exists:', email);
        }
        
        return true;
    } catch (error) {
        console.error('JSONBin Error:', error);
        return false;
    }
}

// Test function to check current emails
async function checkCurrentEmails() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        const data = await response.json();
        console.log('Current bin content:', data);
    } catch (error) {
        console.error('Check Error:', error);
    }
}

// Call this to check current emails
checkCurrentEmails();

// Hide content initially
document.body.style.visibility = 'hidden';

// Check shop status when page loads
document.addEventListener('DOMContentLoaded', checkShopStatus);

// Array of fashion-related emojis
const fashionEmojis = ['👕', '👗', '👚', '👔', '👜', '👠', '🧢', '🎽', '🩱', '🥻'];
let currentEmojiIndex = 0;

// Function to rotate emojis in header
function rotateEmoji() {
    const emojiHeader = document.getElementById('emojiHeader');
    currentEmojiIndex = (currentEmojiIndex + 1) % fashionEmojis.length;
    emojiHeader.textContent = fashionEmojis[currentEmojiIndex];
}

// Rotate emoji every 2 seconds
setInterval(rotateEmoji, 2000);

// Add this countdown function
function updateCountdown() {
    const targetDate = new Date('November 20, 2024 23:59:59').getTime();
    
    function update() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.querySelector('.countdown-container').innerHTML = '<h2>Launch Time!</h2>';
        }
    }

    update();
    const countdownInterval = setInterval(update, 1000);
}

// Call the countdown function
updateCountdown();

// Update the form submission handler
document.getElementById('waitlist-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const submitButton = this.querySelector('button');
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="button-text">Sending</span><span class="emoji">⏳</span>';
    
    try {
        // Save email to JSONBin first
        const saved = await saveEmailToJSONBin(emailInput.value);
        if (!saved) {
            throw new Error('Failed to save email');
        }

        // Send email via EmailJS
        const templateParams = {
            to_email: emailInput.value,
            reply_to: emailInput.value,
            from_name: 'Anxiety',
            to_name: 'Valued Customer'
        };

        await emailjs.send('service_jpmpjhn', 'template_8279m3r', templateParams);

        // Show success dialog
        showDialog('success');
        emailInput.value = '';
        
    } catch (error) {
        console.error('Error:', error);
        // Show error dialog
        showDialog('error');
    }
    
    // Reset button state
    submitButton.disabled = false;
    submitButton.innerHTML = '<span class="button-text">Join Waitlist</span><span class="emoji">✨</span>';
});

// Add these functions to handle the dialog
function showDialog(type) {
    const dialogOverlay = document.getElementById('dialogOverlay');
    const dialogContent = document.querySelector('.dialog-content');
    
    if (type === 'success') {
        dialogContent.innerHTML = `
            <div class="dialog-icon">🛍️</div>
            <h2>Success!</h2>
            <p>You're on the list! Check your email</p>
            <button class="dialog-button" onclick="closeDialog()">Got it!</button>
        `;
    } else {
        dialogContent.innerHTML = `
            <div class="dialog-icon">🛍️</div>
            <h2>Oops!</h2>
            <p>Something went wrong. Please try again.</p>
            <button class="dialog-button" onclick="closeDialog()">Close</button>
        `;
    }
    
    dialogOverlay.style.display = 'flex';
}

function closeDialog() {
    const dialogOverlay = document.getElementById('dialogOverlay');
    dialogOverlay.style.display = 'none';
}

// Close dialog when clicking outside
document.getElementById('dialogOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDialog();
    }
});

// Add this function to restart typing animation when visible
function handleTypingAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'none';
                entry.target.offsetHeight; // Trigger reflow
                entry.target.style.animation = 'typing 4s steps(40) 1s 1 normal both, blink 500ms steps(40) infinite normal';
            }
        });
    }, { threshold: 0.5 });

    const typingText = document.querySelector('.typing-text');
    observer.observe(typingText);
}

// Call the function
handleTypingAnimation();

// Add this to handle placeholder animation better
document.querySelector('input[type="email"]').addEventListener('input', function() {
    const placeholder = document.querySelector('.placeholder-text');
    if (this.value.length > 0) {
        placeholder.classList.add('moved');
    } else {
        placeholder.classList.remove('moved');
    }
});

// Add this to remove the cursor after animation
document.querySelector('.typing-text').addEventListener('animationend', function(e) {
    if (e.animationName === 'typing') {
        this.classList.add('finished');
    }
});
