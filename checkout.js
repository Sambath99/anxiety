document.addEventListener('DOMContentLoaded', () => {
    // Debug logging for cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Initial cart data:', cart);
    
    // Display cart items
    displayCartItems(cart);
    
    // Handle form submission
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
    
    // Add this to your existing JavaScript
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function(e) {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Remove active class from all options
            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to selected option
            this.classList.add('active');
        });
    });
});

function displayCartItems(cart) {
    const cartItemsContainer = document.querySelector('.cart-items');
    let subtotal = 0;
    
    // Add debug logging
    console.log('Displaying cart items:', cart);
    
    if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        subtotal += itemTotal;
        
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='img/placeholder.png';">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p>Size: ${item.size}</p>
                    <p>Quantity: ${quantity}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
                <div class="item-total">
                    $${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
    
    // Update totals
    updateTotals(subtotal);
}

function updateTotals(subtotal) {
    const subtotalElement = document.querySelector('.subtotal .amount');
    const totalElement = document.querySelector('.total .amount');
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    totalElement.textContent = `$${subtotal.toFixed(2)}`; // Add shipping or tax if needed
}

// Toast notification function
function showToast(message, type = 'error') {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: type === 'error' ? "#ff6b6b" : "#51cf66",
        stopOnFocus: true
    }).showToast();
}

// Form validation function
function validateForm(formData) {
    const errors = [];
    
    if (!formData.name.trim()) {
        errors.push("Please enter your full name");
    }
    
    if (!formData.phone.trim()) {
        errors.push("Please enter your phone number");
    } else if (!/^\d{9,10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.push("Please enter a valid phone number");
    }
    
    if (!formData.address.trim()) {
        errors.push("Please enter your delivery address");
    }
    
    if (!formData.paymentMethod) {
        errors.push("Please select a payment method");
    }
    
    return errors;
}

// Update the handleCheckout function
async function handleCheckout(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked')?.value
    };
    
    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
        errors.forEach(error => showToast(error));
        return;
    }
    
    // Get cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }
    
    // Show loading state
    const submitButton = document.querySelector('.place-order-btn');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Create new order object
        const newOrder = {
            ...formData,
            items: cart,
            orderDate: new Date().toISOString(),
            orderTotal: parseFloat(document.querySelector('.total .amount').textContent.replace('$', '')),
            status: 'pending',
            orderId: Date.now()
        };

        // Enhanced Discord webhook message
        const discordMessage = {
            embeds: [{
                title: "🌟 New Order Received! #" + newOrder.orderId.toString().slice(-4),
                description: "```A new order has been placed through the website```",
                color: 0x2ECC71, // Professional green color
                fields: [
                    {
                        name: "👤 Customer Details",
                        value: [
                            `**Name:** ${formData.name}`,
                            `**Phone:** ${formData.phone}`,
                            `**Address:** ${formData.address}`,
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: "💳 Payment Information",
                        value: `**Method:** ${formData.paymentMethod.toUpperCase()}\n**Total Amount:** $${newOrder.orderTotal.toFixed(2)}`,
                        inline: false
                    },
                    {
                        name: "🛍️ Order Items",
                        value: cart.map(item => 
                            `• **${item.name}**\n  └ Size: ${item.size} | Qty: ${item.quantity || 1} | Price: $${(item.price * (item.quantity || 1)).toFixed(2)}`
                        ).join('\n'),
                        inline: false
                    }
                ],
                thumbnail: {
                    url: "https://sambath99.github.io/anxiety/img/logo.PNG" // Replace with your store's logo
                },
                footer: {
                    text: "Anxiety Store | Order Management System",
                    icon_url: "https://i.imgur.com/AfFp7pu.png" // Replace with your store's icon
                },
                timestamp: new Date().toISOString(),
                author: {
                    name: "🛍️ Anxiety Store",
                    url: "https://sambath99.github.io/anxiety/"
                }
            }]
        };

        // Create Telegram message
        const telegramMessage = `
🌟 *New Order #${newOrder.orderId.toString().slice(-4)}*

👤 *Customer Details*
▪️ Name: ${formData.name}
▪️ Phone: ${formData.phone}
▪️ Address: ${formData.address}

💳 *Payment Information*
▪️ Method: ${formData.paymentMethod.toUpperCase()}
▪️ Total: $${newOrder.orderTotal.toFixed(2)}

🛍️ *Order Items*
${cart.map(item => `▪️ ${item.name}
   Size: ${item.size} | Qty: ${item.quantity || 1} | Price: $${(item.price * (item.quantity || 1)).toFixed(2)}`).join('\n')}

📊 *Order Summary*
▪️ Total Items: ${cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}
▪️ Status: 🟡 Pending
▪️ Time: ${new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Phnom_Penh',
    dateStyle: 'medium',
    timeStyle: 'short'
})}`;

        // Execute all three API calls simultaneously
        const [binData, discordResponse, telegramResponse] = await Promise.all([
            // Get existing orders from JSONBin
            fetch('https://api.jsonbin.io/v3/b/672f62feacd3cb34a8a58d90', {
                headers: {
                    'X-Master-Key': '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC'
                }
            }).then(res => res.json()),
            
            // Send Discord webhook
            fetch('https://discord.com/api/webhooks/1305036953468796928/4ZIYHJjTqjJplpaRT9jJ5JfoQvgKg37rXjq6WRmFSJHOxdjqY6jn78Rkfuw54vOQ1VUJ', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordMessage)
            }),

            // Send Telegram message
            fetch(`https://api.telegram.org/bot8176551618:AAGZy2gxoXfxIjCnczbsGYzBeTGxsB6p-Jw/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: '1046129729',
                    text: telegramMessage,
                    parse_mode: 'Markdown'
                })
            })
        ]);

        // Update JSONBin with new order
        const existingOrders = Array.isArray(binData.record) ? binData.record : [];
        const updatedOrders = [...existingOrders, newOrder];
        
        await fetch('https://api.jsonbin.io/v3/b/672f62feacd3cb34a8a58d90', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC'
            },
            body: JSON.stringify(updatedOrders)
        });

        // Clear cart and show success
        localStorage.removeItem('cart');
        showToast('Order placed successfully!', 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Failed to place order. Please try again.');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Place Order';
    }
}

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
