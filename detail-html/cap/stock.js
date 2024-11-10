const BIN_ID = '672ee92aad19ca34f8c6e505';
const API_KEY = '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC';

let currentProduct = null;
let currentStockStatus = 0;

async function fetchProductStatus(productId) {
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
        return data.products[productId];
    } catch (error) {
        console.error('Error fetching product status:', error);
        showMessage('Error fetching product status', 'error');
        return null;
    }
}

async function updateStockStatus(productId, newStatus) {
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

        const currentData = await response.json();
        currentData.products[productId].stock_status = newStatus;

        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(currentData)
        });

        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }

        return true;
    } catch (error) {
        console.error('Error updating stock status:', error);
        showMessage('Error updating stock status', 'error');
        return false;
    }
}

function updateUI(product) {
    const productCard = document.getElementById('productCard');
    const productName = document.getElementById('productName');
    const productPrice = document.getElementById('productPrice');
    const stockStatus = document.getElementById('stockStatus');
    const toggleBtn = document.getElementById('toggleStock');
    
    if (!product) {
        productCard.style.display = 'none';
        return;
    }

    productCard.style.display = 'block';
    productName.textContent = product.name;
    productPrice.textContent = `$${product.price}`;
    currentStockStatus = product.stock_status;

    if (product.stock_status === 1) {
        stockStatus.textContent = 'In Stock';
        stockStatus.className = 'stock-status in-stock';
        toggleBtn.textContent = 'Set Out of Stock';
        toggleBtn.className = 'toggle-btn to-out-of-stock';
    } else {
        stockStatus.textContent = 'Out of Stock';
        stockStatus.className = 'stock-status out-of-stock';
        toggleBtn.textContent = 'Set In Stock';
        toggleBtn.className = 'toggle-btn to-in-stock';
    }
}

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message ${type}`;
    setTimeout(() => {
        message.className = 'message';
    }, 3000);
}

function setLoading(isLoading) {
    const loading = document.getElementById('loading');
    loading.className = `loading ${isLoading ? 'active' : ''}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const productSelect = document.getElementById('productSelect');
    const checkStatus = document.getElementById('checkStatus');
    const toggleBtn = document.getElementById('toggleStock');
    
    checkStatus.addEventListener('click', async () => {
        const selectedProduct = productSelect.value;
        if (!selectedProduct) {
            showMessage('Please select a product', 'error');
            return;
        }
        
        setLoading(true);
        const product = await fetchProductStatus(selectedProduct);
        currentProduct = selectedProduct;
        updateUI(product);
        setLoading(false);
    });

    toggleBtn.addEventListener('click', async () => {
        if (!currentProduct) return;
        
        setLoading(true);
        const newStatus = currentStockStatus === 1 ? 0 : 1;
        
        if (await updateStockStatus(currentProduct, newStatus)) {
            const updatedProduct = await fetchProductStatus(currentProduct);
            updateUI(updatedProduct);
            showMessage('Stock status updated successfully', 'success');
        }
        
        setLoading(false);
    });
}); 