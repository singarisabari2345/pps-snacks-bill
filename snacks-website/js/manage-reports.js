// manage-reports.js - Sales records management logic

let allSales = [];
let displayedSales = [];

// Load sales data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSales();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterSales();
        }
    });
    
    document.getElementById('edit-sale-form').addEventListener('submit', handleEditSubmit);
    
    // Close modal on outside click
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('edit-modal');
        if (event.target === modal) {
            closeEditModal();
        }
    });
}

// Load sales from localStorage
function loadSales() {
    allSales = JSON.parse(localStorage.getItem('sales')) || [];
    displayedSales = [...allSales];
    displaySales();
}

// Display sales records
function displaySales() {
    const tableBody = document.getElementById('sales-table-body');
    
    if (displayedSales.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No sales records found.</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    displayedSales.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tableBody.innerHTML = '';
    
    displayedSales.forEach(sale => {
        const row = document.createElement('tr');
        const date = new Date(sale.date);
        const formattedDate = date.toLocaleString();
        
        // Format items list
        const itemsList = sale.items.map(item => 
            `${item.name} (${item.quantity} × ₹${item.price.toFixed(2)})`
        ).join(', ');
        
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${formattedDate}</td>
            <td>${itemsList}</td>
            <td>₹${sale.total.toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn" onclick="editSale('${sale.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteSale('${sale.id}')">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter sales
function filterSales() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayedSales = [...allSales];
    } else {
        displayedSales = allSales.filter(sale => {
            // Search in transaction ID
            if (sale.id.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Search in date
            const dateStr = new Date(sale.date).toLocaleString().toLowerCase();
            if (dateStr.includes(searchTerm)) {
                return true;
            }
            
            // Search in item names
            const itemNames = sale.items.map(item => item.name.toLowerCase()).join(' ');
            if (itemNames.includes(searchTerm)) {
                return true;
            }
            
            return false;
        });
    }
    
    displaySales();
}

// Clear search
function clearSearch() {
    document.getElementById('search-input').value = '';
    displayedSales = [...allSales];
    displaySales();
}

// Edit sale
function editSale(saleId) {
    const sale = allSales.find(s => s.id === saleId);
    
    if (!sale) {
        showNotification('Sale record not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('edit-sale-id').value = sale.id;
    document.getElementById('edit-transaction-id').value = sale.id;
    
    // Format date for datetime-local input
    const date = new Date(sale.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    document.getElementById('edit-sale-date').value = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    // Populate items
    const itemsContainer = document.getElementById('edit-items-container');
    itemsContainer.innerHTML = '';
    
    sale.items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.style.cssText = 'border: 1px solid #ddd; padding: 1rem; margin-bottom: 0.5rem; border-radius: 5px;';
        itemDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.5rem; align-items: center;">
                <input type="text" class="edit-item-name" value="${item.name}" placeholder="Item Name" style="padding: 0.5rem;">
                <input type="number" class="edit-item-price" value="${item.price}" step="0.01" min="0" placeholder="Price" style="padding: 0.5rem;">
                <input type="number" class="edit-item-quantity" value="${item.quantity}" min="1" placeholder="Qty" style="padding: 0.5rem;">
                <button type="button" class="btn btn-danger" onclick="removeEditItem(this)" style="padding: 0.5rem;">Remove</button>
            </div>
        `;
        itemsContainer.appendChild(itemDiv);
    });
    
    document.getElementById('edit-total-amount').value = sale.total.toFixed(2);
    
    // Show modal
    document.getElementById('edit-modal').style.display = 'block';
    
    // Recalculate total when items change
    attachItemChangeListeners();
}

// Attach change listeners to item inputs
function attachItemChangeListeners() {
    const nameInputs = document.querySelectorAll('.edit-item-name');
    const priceInputs = document.querySelectorAll('.edit-item-price');
    const quantityInputs = document.querySelectorAll('.edit-item-quantity');
    
    const recalculate = () => {
        let total = 0;
        priceInputs.forEach((priceInput, index) => {
            const price = parseFloat(priceInput.value) || 0;
            const quantity = parseFloat(quantityInputs[index].value) || 0;
            total += price * quantity;
        });
        document.getElementById('edit-total-amount').value = total.toFixed(2);
    };
    
    [...priceInputs, ...quantityInputs].forEach(input => {
        input.addEventListener('input', recalculate);
    });
}

// Add item to edit form
function addEditItem() {
    const itemsContainer = document.getElementById('edit-items-container');
    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = 'border: 1px solid #ddd; padding: 1rem; margin-bottom: 0.5rem; border-radius: 5px;';
    itemDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.5rem; align-items: center;">
            <input type="text" class="edit-item-name" value="" placeholder="Item Name" style="padding: 0.5rem;">
            <input type="number" class="edit-item-price" value="0" step="0.01" min="0" placeholder="Price" style="padding: 0.5rem;">
            <input type="number" class="edit-item-quantity" value="1" min="1" placeholder="Qty" style="padding: 0.5rem;">
            <button type="button" class="btn btn-danger" onclick="removeEditItem(this)" style="padding: 0.5rem;">Remove</button>
        </div>
    `;
    itemsContainer.appendChild(itemDiv);
    attachItemChangeListeners();
}

// Remove item from edit form
function removeEditItem(button) {
    button.closest('div[style*="border"]').remove();
    attachItemChangeListeners();
    // Recalculate total
    const priceInputs = document.querySelectorAll('.edit-item-price');
    const quantityInputs = document.querySelectorAll('.edit-item-quantity');
    let total = 0;
    priceInputs.forEach((priceInput, index) => {
        const price = parseFloat(priceInput.value) || 0;
        const quantity = parseFloat(quantityInputs[index].value) || 0;
        total += price * quantity;
    });
    document.getElementById('edit-total-amount').value = total.toFixed(2);
}

// Handle edit form submission
function handleEditSubmit(e) {
    e.preventDefault();
    
    const saleId = document.getElementById('edit-sale-id').value;
    const saleDate = document.getElementById('edit-sale-date').value;
    const totalAmount = parseFloat(document.getElementById('edit-total-amount').value);
    
    // Collect items
    const nameInputs = document.querySelectorAll('.edit-item-name');
    const priceInputs = document.querySelectorAll('.edit-item-price');
    const quantityInputs = document.querySelectorAll('.edit-item-quantity');
    
    if (nameInputs.length === 0) {
        showNotification('At least one item is required!', 'error');
        return;
    }
    
    const items = [];
    nameInputs.forEach((nameInput, index) => {
        const name = nameInput.value.trim();
        const price = parseFloat(priceInputs[index].value);
        const quantity = parseInt(quantityInputs[index].value);
        
        if (name && price > 0 && quantity > 0) {
            items.push({
                name: name,
                price: price,
                quantity: quantity
            });
        }
    });
    
    if (items.length === 0) {
        showNotification('Please add at least one valid item!', 'error');
        return;
    }
    
    // Update sale record
    const saleIndex = allSales.findIndex(s => s.id === saleId);
    if (saleIndex !== -1) {
        // Convert datetime-local to ISO string
        const dateObj = new Date(saleDate);
        
        allSales[saleIndex].date = dateObj.toISOString();
        allSales[saleIndex].items = items;
        allSales[saleIndex].total = totalAmount;
        
        localStorage.setItem('sales', JSON.stringify(allSales));
        showNotification('Sale record updated successfully!');
        
        closeEditModal();
        loadSales();
    } else {
        showNotification('Sale record not found!', 'error');
    }
}

// Delete sale
function deleteSale(saleId) {
    if (!confirm('Are you sure you want to delete this sale record? This action cannot be undone.')) {
        return;
    }
    
    allSales = allSales.filter(sale => sale.id !== saleId);
    localStorage.setItem('sales', JSON.stringify(allSales));
    showNotification('Sale record deleted successfully!');
    loadSales();
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-sale-form').reset();
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? '#dc3545' : '#28a745';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add animation styles if not already present
if (!document.getElementById('animation-styles')) {
    const style = document.createElement('style');
    style.id = 'animation-styles';
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
}

