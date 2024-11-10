document.addEventListener('DOMContentLoaded', async () => {
    await fetchStockStatus();
});

async function fetchStockStatus() {
    try {
        const response = await fetch('https://api.jsonbin.io/v3/b/672f523be41b4d34e451504b/latest', {
            headers: {
                'X-Master-Key': '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC',
                'X-Bin-Meta': false
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Stock data:', data);

        // Update each product's stock status
        Object.entries(data.products).forEach(([productId, productData]) => {
            const productElement = document.querySelector(`[data-product-id="${productId}"]`);
            if (productElement) {
                // Update stock status display
                updateStockStatus(productElement, productData.stock_status);

                // Update size availability if product has sizes
                if (productData.sizes) {
                    updateSizeAvailability(productElement, productData.sizes);
                }
            }
        });

    } catch (error) {
        console.error('Error fetching stock status:', error);
    }
}

function updateStockStatus(productElement, status) {
    const stockStatusElement = productElement.querySelector('.stock-status');
    if (!stockStatusElement) {
        console.warn('Stock status element not found for product:', productElement);
        return;
    }

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
        const addToCartBtn = productElement.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.disabled = true;
            addToCartBtn.style.opacity = '0.5';
            addToCartBtn.style.cursor = 'not-allowed';
        }
    }
}

function updateSizeAvailability(productElement, sizes) {
    const sizeButtons = productElement.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
        const size = button.dataset.size;
        if (!sizes[size]) {
            button.classList.add('disabled');
            button.disabled = true;
        }
    });
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