const BIN_ID = '672f523be41b4d34e451504b';
const API_KEY = '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC';

let selectedSize = null;
let stockStatus = 0;

function generateImagePaths() {
    const baseFolder = './shirt-010/';
    const images = [];
    
    // Add all images from the folder
    const imageNames = [
        '010back.JPEG',
        '010front.JPEG',
    ];
     
    imageNames.forEach(imageName => {
        images.push(baseFolder + imageName);
    });
    
    return images;
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

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded'); // Debug log
    
    // Fetch stock status first
    stockStatus = await fetchStockStatus();
    updateStockStatus(stockStatus);
    
    // Image gallery setup
    const images = generateImagePaths();
    let currentImageIndex = 0;
    
    const mainImage = document.getElementById('mainImage');
    const thumbnailTrack = document.getElementById('thumbnailTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // Initialize the gallery with the first image
    if (images.length > 0) {
        mainImage.src = images[0];
        createThumbnails();
    }

    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            setActiveImage(currentImageIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            setActiveImage(currentImageIndex);
        });
    }

    function createThumbnails() {
        if (!thumbnailTrack) return;
        
        thumbnailTrack.innerHTML = ''; // Clear existing thumbnails
        images.forEach((src, index) => {
            const thumb = document.createElement('img');
            thumb.className = 'thumbnail';
            thumb.src = src;
            thumb.alt = `Thumbnail ${index + 1}`;
            thumb.addEventListener('click', () => setActiveImage(index));
            thumbnailTrack.appendChild(thumb);
        });
    }

    function setActiveImage(index) {
        if (!mainImage) return;
        currentImageIndex = index;
        mainImage.src = images[index];
        
        // Update thumbnails active state
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    // Size selection functionality
    const sizeButtons = document.querySelectorAll('.size-btn');
    console.log('Found size buttons:', sizeButtons.length); // Debug log
    
    sizeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Size button clicked:', this.dataset.size); // Debug log
            
            // Skip if button is disabled
            if (this.classList.contains('disabled')) {
                return;
            }
            
            // Remove active class from all buttons
            sizeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            selectedSize = this.dataset.size;
            console.log('Size selected:', selectedSize); // Debug log
        });
    });

    // Initialize cart count from localStorage
    updateMainCart();
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
    console.log('Current selectedSize:', selectedSize);
    
    if (stockStatus === 0) {
        showToast('Sorry, this item is currently out of stock.');
        return;
    }
    
    if (!selectedSize) {
        showToast('Please select a size');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value);
    const price = 5.00; // Set your shirt price
    
    // Get existing cart or initialize empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Create cart item
    const item = {
        id: Date.now(), // Unique ID for the item
        name: 'Shirt 010',
        size: selectedSize,
        quantity: quantity,
        price: price,
        image: './detail-image/shirt/shirt-010/010front.JPEG', // Update with correct image path
        type: 'shirt'
    };
    
    // Add item to cart
    cart.push(item);
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in UI
    updateMainCart();
    
    // Show success message
    showToast(`Added ${quantity} Shirt${quantity > 1 ? 's' : ''} (${selectedSize}) to cart`);
    
    // Optional: Reset selection
    selectedSize = null;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('quantity').value = 1;
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

async function fetchStockStatus() {
    try {
        console.log('Fetching stock status...'); // Debug log
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY,
                'X-Bin-Meta': false,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Response status:', response.status); // Debug log
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.products && data.products.shirt010 && data.products.shirt010.sizes) {
            const sizeButtons = document.querySelectorAll('.size-btn');
            sizeButtons.forEach(button => {
                const size = button.dataset.size;
                if (!data.products.shirt010.sizes[size]) {
                    button.classList.add('disabled');
                }
            });
            
            return data.products.shirt010.stock_status;
        } else {
            console.error('Invalid data structure:', data);
            return 0;
        }
    } catch (error) {
        console.error('Error fetching stock status:', error);
        return 0;
    }
}

function updateStockStatus(status) {
    console.log('Updating stock status:', status); // Debug log
    const stockStatusElement = document.querySelector('.stock-status');
    
    if (status === 1) {
        stockStatusElement.classList.remove('out-of-stock');
        stockStatusElement.classList.add('in-stock');
        stockStatusElement.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>In Stock</span>
        `;
    } else {
        stockStatusElement.classList.remove('in-stock');
        stockStatusElement.classList.add('out-of-stock');
        stockStatusElement.innerHTML = `
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