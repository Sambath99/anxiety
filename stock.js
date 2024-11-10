const BIN_ID = '672f523be41b4d34e451504b';
const API_KEY = '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC';

let productsData = {};
let pendingChanges = {};

async function loadAllProducts() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        productsData = data.products;
        renderAllProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showMessage('Error loading products', 'error');
    }
}

function renderAllProducts() {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    // Group products by type
    const productsByType = {
        hoodie: [],
        shirt: [],
        cap: []
    };

    Object.entries(productsData).forEach(([productId, product]) => {
        productsByType[product.type].push({ id: productId, ...product });
    });

    // Render each product type section
    Object.entries(productsByType).forEach(([type, products]) => {
        if (products.length === 0) return;

        const section = document.createElement('div');
        section.className = 'product-section';
        section.innerHTML = `
            <h2 class="section-title">${type.charAt(0).toUpperCase() + type.slice(1)}s</h2>
            <div class="product-grid">
                ${products.map(product => createProductCard(product)).join('')}
            </div>
        `;
        productGrid.appendChild(section);
    });
}

function createProductCard({ id, type, stock_status, sizes }) {
    const productNumber = id.split('-').pop();
    const hasSizes = !!sizes;

    return `
        <div class="product-card" data-product-id="${id}">
            <div class="product-header">
                <div class="product-name">${type.charAt(0).toUpperCase() + type.slice(1)} ${productNumber}</div>
            </div>
            <div class="stock-controls">
                <div class="stock-toggle">
                    <label class="switch">
                        <input type="checkbox" 
                            ${stock_status === 1 ? 'checked' : ''} 
                            onchange="handleStockToggle('${id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                    <span class="status-text ${stock_status === 1 ? 'in-stock' : 'out-of-stock'}">
                        ${stock_status === 1 ? 'In Stock' : 'Out of Stock'}
                    </span>
                </div>
                ${hasSizes ? createSizesGrid(id, sizes) : ''}
            </div>
        </div>
    `;
}

function createSizesGrid(productId, sizes) {
    return `
        <div class="sizes-grid">
            ${Object.entries(sizes).map(([size, available]) => `
                <div class="size-item ${available ? 'available' : 'unavailable'}">
                    <span>${size}</span>
                    <label class="switch">
                        <input type="checkbox" 
                            ${available ? 'checked' : ''} 
                            onchange="handleSizeToggle('${productId}', '${size}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
            `).join('')}
        </div>
    `;
}

function handleStockToggle(productId, isChecked) {
    if (!pendingChanges[productId]) {
        pendingChanges[productId] = { ...productsData[productId] };
    }
    pendingChanges[productId].stock_status = isChecked ? 1 : 0;
    updateSubmitButtonState();
}

function handleSizeToggle(productId, size, isChecked) {
    if (!pendingChanges[productId]) {
        pendingChanges[productId] = { ...productsData[productId] };
    }
    if (!pendingChanges[productId].sizes) {
        pendingChanges[productId].sizes = { ...productsData[productId].sizes };
    }
    pendingChanges[productId].sizes[size] = isChecked;
    updateSubmitButtonState();
}

function updateSubmitButtonState() {
    const submitButton = document.getElementById('submitChanges');
    const hasChanges = Object.keys(pendingChanges).length > 0;
    submitButton.disabled = !hasChanges;
    submitButton.classList.toggle('active', hasChanges);
}

function setLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    if (isLoading) {
        loadingElement.classList.add('active');
    } else {
        loadingElement.classList.remove('active');
    }
}

function showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    
    // Hide message after 3 seconds
    setTimeout(() => {
        messageElement.className = 'message';
        messageElement.textContent = '';
    }, 3000);
}

async function submitChanges() {
    const submitButton = document.getElementById('submitChanges');
    submitButton.disabled = true;
    setLoading(true);

    try {
        const updatedData = { ...productsData };
        Object.entries(pendingChanges).forEach(([productId, changes]) => {
            updatedData[productId] = changes;
        });

        console.log('Submitting changes:', pendingChanges);

        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ products: updatedData })
        });

        console.log('Response status:', response.status);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const responseData = await response.json();
        console.log('Response data:', responseData);

        productsData = updatedData;
        pendingChanges = {};
        showMessage('Changes saved successfully', 'success');
        renderAllProducts();
    } catch (error) {
        console.error('Error saving changes:', error);
        showMessage('Error saving changes', 'error');
    } finally {
        setLoading(false);
        updateSubmitButtonState();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
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