const BIN_ID = '672f523be41b4d34e451504b';
const API_KEY = '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC';
let stockStatus = 0;
function generateImagePaths() {
    const baseFolder = './cap-014/';
    const images = [];
    
    // Add all images from the folder
    const imageNames = [
        'cap3.PNG',
        'capblack.png'
    ];
    
    imageNames.forEach(imageName => {
        images.push(baseFolder + imageName);
    });
    
    return images;
}

// Load images when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch stock status first
    stockStatus = await fetchStockStatus();
    updateStockStatus(stockStatus);
    // Update the UI based on stock status
    updateStockStatus(stockStatus);
    
    const images = generateImagePaths();
    let currentImageIndex = 0;
    
    const mainImage = document.getElementById('mainImage');
    const thumbnailTrack = document.getElementById('thumbnailTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const thumbPrevBtn = document.getElementById('thumbPrevBtn');
    const thumbNextBtn = document.getElementById('thumbNextBtn');

    // Initialize the gallery with the first image
    if (images.length > 0) {
        mainImage.src = images[0];
        createThumbnails();
    }

    function createThumbnails() {
        thumbnailTrack.innerHTML = ''; // Clear existing thumbnails
        images.forEach((src, index) => {
            const thumb = document.createElement('img');
            thumb.className = 'thumbnail loading';
            thumb.alt = `Thumbnail ${index + 1}`;
            
            // Remove loading class when image loads
            thumb.onload = () => {
                thumb.classList.remove('loading');
                thumb.classList.toggle('active', index === currentImageIndex);
            };
            
            thumb.src = src;
            thumb.addEventListener('click', () => setActiveImage(index));
            thumbnailTrack.appendChild(thumb);
        });
    }

    function setActiveImage(index) {
        currentImageIndex = index;
        mainImage.src = images[index];
        
        // Update thumbnails active state
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        setActiveImage(currentImageIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        setActiveImage(currentImageIndex);
    });

    // Thumbnail scroll buttons
    thumbPrevBtn.addEventListener('click', () => {
        thumbnailTrack.scrollBy({
            left: -200,
            behavior: 'smooth'
        });
    });

    thumbNextBtn.addEventListener('click', () => {
        thumbnailTrack.scrollBy({
            left: 200,
            behavior: 'smooth'
        });
    });

    // Quantity functions
    function incrementQuantity() {
        const quantityInput = document.getElementById('quantity');
        quantityInput.value = parseInt(quantityInput.value) + 1;
    }

    function decrementQuantity() {
        const quantityInput = document.getElementById('quantity');
        if (parseInt(quantityInput.value) > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
        }
    }



    // Add this function to handle stock status
    function updateStockStatus(status) {
        const stockStatus = document.querySelector('.stock-status');
        
        if (status === 1) {
            stockStatus.classList.remove('out-of-stock');
            stockStatus.classList.add('in-stock');
            stockStatus.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>In Stock</span>
            `;
        } else {
            stockStatus.classList.remove('in-stock');
            stockStatus.classList.add('out-of-stock');
            stockStatus.innerHTML = `
                <i class="fas fa-times-circle"></i>
                <span>Out of Stock</span>
            `;
            
            // Disable add to cart button
            const addToCartBtn = document.querySelector('.add-to-cart-btn');
            if (addToCartBtn) {
                addToCartBtn.disabled = true;
                addToCartBtn.style.opacity = '0.5';
                addToCartBtn.style.cursor = 'not-allowed';
            }
        }
    }

    // Add this function to fetch stock status
    async function fetchStockStatus() {
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': API_KEY,
                    'X-Bin-Meta': false
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            // In fetchStockStatus() function, update the return line:
return data.products.cap014.stock_status;
        } catch (error) {
            console.error('Error fetching stock status:', error);
            return 0;
        }
    }
});
function showToast(message) {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

    // Add toast to container
    container.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

function addToCart() {
    console.log('Add to cart clicked');

    
    if (stockStatus === 0) {
        showToast('Sorry, this item is currently out of stock.');
        return;
    }
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = 5.00; // Set your hoodie price
    
    // Get existing cart or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Create cart item
    const item = {
        id: Date.now(), // Unique ID for the item
        name: 'Cap 014',
        quantity: quantity,
        price: price,
        image: './detail-image/cap/cap-014/capblack.png', // Update with correct image path
        type: 'cap'
    };
    
    // Add item to cart
    cart.push(item);
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in UI
    updateMainCart();
    
    // Show success message
    showToast(`Added ${quantity} Cap${quantity > 1 ? 's' : ''} to cart`);
    
    document.getElementById('quantity').value = 1;
}
function updateMainCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        // Calculate total quantity
        const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalQuantity;
    }
}
function incrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    quantityInput.value = parseInt(quantityInput.value) + 1;
}

function decrementQuantity() {
    const quantityInput = document.getElementById('quantity');
    if (parseInt(quantityInput.value) > 1) {
        quantityInput.value = parseInt(quantityInput.value) - 1;
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