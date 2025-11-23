// App.js - Main application logic for cart and billing

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Load menu items on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems();
    updateCart();
    initializeEventListeners();
});

// Load menu items from localStorage
function loadMenuItems() {
    const menuGrid = document.getElementById('menu-grid');
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    
    // If no menu items, initialize with default items
    if (menuItems.length === 0) {
        initializeDefaultMenu();
        loadMenuItems(); // Reload after initialization
        return;
    }
    
    menuGrid.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';
        menuItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'">
            <h3>${item.name}</h3>
            <div class="price">₹${parseFloat(item.price).toFixed(2)}</div>
        `;
        menuItemDiv.addEventListener('click', () => addToCart(item));
        menuGrid.appendChild(menuItemDiv);
    });
}

// Initialize default menu items
function initializeDefaultMenu() {
    const defaultMenu = [
        {
            id: 1,
            name: 'Mixture',
            price: 50.00,
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ff9800%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22white%22 font-family=%22sans-serif%22 font-size=%2220%22 font-weight=%22bold%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EMixture%3C/text%3E%3C/svg%3E'
        },
        {
            id: 2,
            name: 'Nippat',
            price: 40.00,
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ff5722%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22white%22 font-family=%22sans-serif%22 font-size=%2220%22 font-weight=%22bold%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENippat%3C/text%3E%3C/svg%3E'
        },
        {
            id: 3,
            name: 'Murukku',
            price: 60.00,
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ffc107%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22white%22 font-family=%22sans-serif%22 font-size=%2220%22 font-weight=%22bold%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EMurukku%3C/text%3E%3C/svg%3E'
        },
        {
            id: 4,
            name: 'Popcorn',
            price: 30.00,
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ffeb3b%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22%23333%22 font-family=%22sans-serif%22 font-size=%2220%22 font-weight=%22bold%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EPopcorn%3C/text%3E%3C/svg%3E'
        }
    ];
    
    localStorage.setItem('menuItems', JSON.stringify(defaultMenu));
}

// Add item to cart
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            quantity: 1,
            image: item.image
        });
    }
    
    saveCart();
    updateCart();
    
    // Show feedback
    showNotification(`${item.name} added to cart!`);
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCart();
}

// Update item quantity
function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            updateCart();
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart display
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="item-price">₹${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItemDiv);
    });
    
    const total = calculateTotal();
    cartTotal.textContent = total.toFixed(2);
}

// Calculate total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Clear cart
function clearCart() {
    if (cart.length === 0) {
        showNotification('Cart is already empty!');
        return;
    }
    
    if (confirm('Are you sure you want to clear the cart?')) {
        cart = [];
        saveCart();
        updateCart();
        showNotification('Cart cleared!');
    }
}

// Process payment
function processPayment() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Generate QR code
    const total = calculateTotal();
    const qrData = `Payment Amount: ₹${total.toFixed(2)}`;
    
    const modal = document.getElementById('payment-modal');
    const qrContainer = document.getElementById('qr-code-container');
    qrContainer.innerHTML = '';
    
    QRCode.toCanvas(qrContainer, qrData, {
        width: 200,
        margin: 2
    }, function(error) {
        if (error) {
            qrContainer.innerHTML = '<p>QR Code generation failed</p>';
        }
    });
    
    modal.style.display = 'block';
}

// Confirm payment
function confirmPayment() {
    const total = calculateTotal();
    const transactionId = 'TXN' + Date.now();
    const sale = {
        id: transactionId,
        date: new Date().toISOString(),
        items: [...cart],
        total: total
    };
    
    // Save sale to localStorage
    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    sales.push(sale);
    localStorage.setItem('sales', JSON.stringify(sales));
    
    // Clear cart
    cart = [];
    saveCart();
    updateCart();
    
    // Close modal
    document.getElementById('payment-modal').style.display = 'none';
    
    showNotification('Payment successful! Thank you for your purchase.');
}

// Print bill
function printBill() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    const billPrint = document.getElementById('bill-print');
    const billItems = document.getElementById('bill-items');
    const billTotal = document.getElementById('bill-total');
    const billDate = document.getElementById('bill-date');
    const billTransactionId = document.getElementById('bill-transaction-id');
    
    // Generate transaction ID
    const transactionId = 'TXN' + Date.now();
    
    // Populate bill
    billDate.textContent = new Date().toLocaleString();
    billTransactionId.textContent = transactionId;
    
    billItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>₹${itemTotal.toFixed(2)}</td>
        `;
        billItems.appendChild(row);
    });
    
    billTotal.textContent = total.toFixed(2);
    
    // Show bill and print
    billPrint.style.display = 'block';
    window.print();
    billPrint.style.display = 'none';
}

// Initialize event listeners
function initializeEventListeners() {
    // Clear cart button
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
    
    // Pay now button
    document.getElementById('pay-now-btn').addEventListener('click', processPayment);
    
    // Print bill button
    document.getElementById('print-bill-btn').addEventListener('click', printBill);
    
    // Confirm payment button
    document.getElementById('confirm-payment-btn').addEventListener('click', confirmPayment);
    
    // Close modal
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('payment-modal').style.display = 'none';
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('payment-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

