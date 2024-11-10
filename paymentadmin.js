const API_URL = 'https://api.jsonbin.io/v3/b/672f62feacd3cb34a8a58d90';
const API_KEY = '$2a$10$ecN6fjgbGla2pDCn7zYV1uaxDxNAQ.8chczGAcSCuGMQAFhPcXhEC';

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    
    // Event listeners
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('searchInput').addEventListener('input', filterOrders);
    
    // Modal close button
    document.querySelector('.close-modal').addEventListener('click', hideModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('orderModal');
        if (e.target === modal) {
            hideModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
        }
    });
});

async function loadOrders() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        displayOrders(data.record);
    } catch (error) {
        showToast('Failed to load orders', 'error');
        console.error(error);
    }
}

function displayOrders(orders) {
    const container = document.querySelector('.orders-container');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<p class="no-orders">No orders found</p>';
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.orderId}">
            <div class="order-header">
                <span class="order-id">Order #${order.orderId}</span>
                <span class="order-date">${new Date(order.orderDate).toLocaleString()}</span>
                <span class="order-status status-${order.status}">${order.status}</span>
            </div>
            <div class="customer-info">
                <p><i class="fas fa-user"></i> ${order.name}</p>
                <p><i class="fas fa-phone"></i> ${order.phone}</p>
                <p><i class="fas fa-money-bill"></i> $${order.orderTotal.toFixed(2)}</p>
            </div>
            <div class="order-actions">
                <button class="view-btn" onclick="viewOrderDetails(${order.orderId})">
                    <i class="fas fa-eye"></i> View Details
                </button>
                ${order.status === 'pending' ? `
                    <button class="complete-btn" onclick="updateOrderStatus(${order.orderId}, 'completed')">
                        <i class="fas fa-check"></i> Mark Complete
                    </button>
                ` : ''}
                <button class="delete-btn" onclick="deleteOrder(${order.orderId})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const orderCards = document.querySelectorAll('.order-card');
    
    orderCards.forEach(card => {
        const status = card.querySelector('.order-status').textContent;
        const customerInfo = card.querySelector('.customer-info').textContent.toLowerCase();
        const orderId = card.querySelector('.order-id').textContent.toLowerCase();
        
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        const matchesSearch = !searchTerm || 
            customerInfo.includes(searchTerm) || 
            orderId.includes(searchTerm);
        
        card.style.display = matchesStatus && matchesSearch ? 'block' : 'none';
    });
}

async function viewOrderDetails(orderId) {
    try {
        showModal(); // Show modal first
        const modal = document.getElementById('orderModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading order details...</p>
            </div>
        `;

        const response = await fetch(API_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch order details');
        
        const data = await response.json();
        const order = data.record.find(o => o.orderId === orderId);
        
        if (!order) throw new Error('Order not found');
        
        modalBody.innerHTML = `
            <h2>Order Details #${order.orderId}</h2>
            <div class="customer-details">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${order.name}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            </div>
            <div class="order-items">
                <h3>Order Items</h3>
                ${order.items.map(item => `
                    <div class="item-card">
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            <p>Size: ${item.size}</p>
                            <p>Quantity: ${item.quantity}</p>
                            <p>Price: $${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="total-section">
                <h3>Total: $${order.orderTotal.toFixed(2)}</h3>
            </div>
        `;
    } catch (error) {
        showToast('Failed to load order details', 'error');
        console.error(error);
        hideModal();
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        // First, get current orders
        const response = await fetch(API_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        const orders = data.record;
        
        // Update the status
        const updatedOrders = orders.map(order => 
            order.orderId === orderId ? {...order, status: newStatus} : order
        );
        
        // Save updated orders
        const updateResponse = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(updatedOrders)
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update order');
        
        showToast('Order status updated successfully', 'success');
        loadOrders();
    } catch (error) {
        showToast('Failed to update order status', 'error');
        console.error(error);
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
        // First, get current orders
        const response = await fetch(API_URL, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        
        const data = await response.json();
        const orders = data.record;
        
        // Filter out the deleted order
        const updatedOrders = orders.filter(order => order.orderId !== orderId);
        
        // Save updated orders - wrap in record object
        const updateResponse = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            // Wrap the orders array in a record object
            body: JSON.stringify({
                record: updatedOrders
            })
        });
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`Failed to delete order: ${errorData.message || 'Unknown error'}`);
        }
        
        showToast('Order deleted successfully', 'success');
        loadOrders();
    } catch (error) {
        showToast(`Failed to delete order: ${error.message}`, 'error');
        console.error(error);
    }
}

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

function showModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function hideModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
} 