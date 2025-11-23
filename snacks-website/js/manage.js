// manage.js - Menu management logic (CRUD operations)

let editingId = null;

// Load menu items on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMenuItems();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    const form = document.getElementById('menu-form');
    const imageInput = document.getElementById('item-image');
    const cancelBtn = document.getElementById('cancel-btn');
    
    form.addEventListener('submit', handleFormSubmit);
    imageInput.addEventListener('change', handleImagePreview);
    cancelBtn.addEventListener('click', resetForm);
}

// Load menu items from localStorage
function loadMenuItems() {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const tableBody = document.getElementById('menu-table-body');
    
    if (menuItems.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No menu items found. Add your first item above!</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    menuItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23ddd%22 width=%2280%22 height=%2280%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2210%22 dy=%2210.5%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'"></td>
            <td>${item.name}</td>
            <td>₹${parseFloat(item.price).toFixed(2)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn" onclick="editItem(${item.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteItem(${item.id})">Delete</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('item-name').value.trim();
    const price = document.getElementById('item-price').value;
    const imageInput = document.getElementById('item-image');
    const itemId = document.getElementById('item-id').value;
    
    if (!name || !price) {
        showNotification('Please fill in all required fields!', 'error');
        return;
    }
    
    // Handle image
    if (imageInput.files.length === 0 && !editingId) {
        showNotification('Please select an image!', 'error');
        return;
    }
    
    let imageBase64 = '';
    
    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imageBase64 = e.target.result;
            saveMenuItem(name, price, imageBase64, itemId);
        };
        
        reader.readAsDataURL(file);
    } else {
        // Editing without changing image - keep existing image
        const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        const existingItem = menuItems.find(item => item.id == itemId);
        if (existingItem) {
            imageBase64 = existingItem.image;
            saveMenuItem(name, price, imageBase64, itemId);
        }
    }
}

// Save menu item
function saveMenuItem(name, price, image, itemId) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    
    if (itemId) {
        // Update existing item
        const index = menuItems.findIndex(item => item.id == itemId);
        if (index !== -1) {
            menuItems[index].name = name;
            menuItems[index].price = parseFloat(price);
            if (image) {
                menuItems[index].image = image;
            }
            showNotification('Menu item updated successfully!');
        }
    } else {
        // Create new item
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
        menuItems.push({
            id: newId,
            name: name,
            price: parseFloat(price),
            image: image
        });
        showNotification('Menu item added successfully!');
    }
    
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    loadMenuItems();
    resetForm();
}

// Edit item
function editItem(id) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const item = menuItems.find(item => item.id == id);
    
    if (!item) {
        showNotification('Item not found!', 'error');
        return;
    }
    
    editingId = id;
    document.getElementById('item-id').value = id;
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-price').value = item.price;
    document.getElementById('form-title').textContent = 'Edit Menu Item';
    document.getElementById('submit-btn').textContent = 'Update Item';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    document.getElementById('item-image').required = false;
    
    // Show existing image preview
    document.getElementById('preview-img').src = item.image;
    document.getElementById('image-preview').style.display = 'block';
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

// Delete item
function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    const filteredItems = menuItems.filter(item => item.id !== id);
    
    localStorage.setItem('menuItems', JSON.stringify(filteredItems));
    loadMenuItems();
    showNotification('Menu item deleted successfully!');
    
    // If deleting the item being edited, reset form
    if (editingId == id) {
        resetForm();
    }
}

// Reset form
function resetForm() {
    editingId = null;
    document.getElementById('menu-form').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('form-title').textContent = 'Add New Menu Item';
    document.getElementById('submit-btn').textContent = 'Add Item';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('item-image').required = true;
}

// Handle image preview
function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('preview-img').src = e.target.result;
            document.getElementById('image-preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
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

