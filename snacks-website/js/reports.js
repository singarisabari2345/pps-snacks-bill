// reports.js - Sales reports logic

let allSales = [];
let filteredSales = [];

// Load sales data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSales();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    document.getElementById('month-filter').addEventListener('change', filterSales);
    document.getElementById('year-filter').addEventListener('change', filterSales);
}

// Load sales from localStorage
function loadSales() {
    allSales = JSON.parse(localStorage.getItem('sales')) || [];
    filteredSales = [...allSales];
    
    populateYearFilter();
    displayReports();
}

// Populate year filter
function populateYearFilter() {
    const yearSelect = document.getElementById('year-filter');
    const years = new Set();
    
    allSales.forEach(sale => {
        const date = new Date(sale.date);
        years.add(date.getFullYear());
    });
    
    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    sortedYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Filter sales by month and year
function filterSales() {
    const monthFilter = document.getElementById('month-filter').value;
    const yearFilter = document.getElementById('year-filter').value;
    
    filteredSales = allSales.filter(sale => {
        const date = new Date(sale.date);
        const month = date.getMonth().toString();
        const year = date.getFullYear().toString();
        
        const matchesMonth = !monthFilter || month === monthFilter;
        const matchesYear = !yearFilter || year === yearFilter;
        
        return matchesMonth && matchesYear;
    });
    
    displayReports();
}

// Display reports
function displayReports() {
    displayStatistics();
    displayMonthlyBreakdown();
    displayItemWiseSales();
}

// Display statistics
function displayStatistics() {
    const statistics = document.getElementById('statistics');
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = filteredSales.length;
    const averageSale = totalTransactions > 0 ? totalSales / totalTransactions : 0;
    
    // Group by month
    const monthlySales = {};
    filteredSales.forEach(sale => {
        const date = new Date(sale.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlySales[monthKey] = (monthlySales[monthKey] || 0) + sale.total;
    });
    const uniqueMonths = Object.keys(monthlySales).length;
    
    statistics.innerHTML = `
        <div class="stat-card">
            <h3>Total Sales</h3>
            <div class="value">₹${totalSales.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Total Transactions</h3>
            <div class="value">${totalTransactions}</div>
        </div>
        <div class="stat-card">
            <h3>Average Sale</h3>
            <div class="value">₹${averageSale.toFixed(2)}</div>
        </div>
        <div class="stat-card">
            <h3>Active Months</h3>
            <div class="value">${uniqueMonths}</div>
        </div>
    `;
}

// Display monthly breakdown
function displayMonthlyBreakdown() {
    const container = document.getElementById('monthly-breakdown');
    
    if (filteredSales.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No sales data available for the selected period.</p>';
        return;
    }
    
    // Group sales by month
    const monthlyData = {};
    filteredSales.forEach(sale => {
        const date = new Date(sale.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                name: monthName,
                total: 0,
                transactions: 0
            };
        }
        
        monthlyData[monthKey].total += sale.total;
        monthlyData[monthKey].transactions += 1;
    });
    
    // Sort by date (newest first)
    const sortedMonths = Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0]));
    
    let html = '<h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #667eea;">Monthly Breakdown</h3>';
    html += '<table><thead><tr><th>Month</th><th>Transactions</th><th>Total Sales</th></tr></thead><tbody>';
    
    sortedMonths.forEach(([key, data]) => {
        html += `
            <tr>
                <td>${data.name}</td>
                <td>${data.transactions}</td>
                <td>₹${data.total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Display item-wise sales
function displayItemWiseSales() {
    const container = document.getElementById('item-wise-sales');
    
    if (filteredSales.length === 0) {
        return;
    }
    
    // Aggregate item-wise sales
    const itemSales = {};
    
    filteredSales.forEach(sale => {
        sale.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = {
                    quantity: 0,
                    revenue: 0
                };
            }
            itemSales[item.name].quantity += item.quantity;
            itemSales[item.name].revenue += item.price * item.quantity;
        });
    });
    
    // Sort by revenue (highest first)
    const sortedItems = Object.entries(itemSales).sort((a, b) => b[1].revenue - a[1].revenue);
    
    let html = '<h3 style="margin-top: 2rem; margin-bottom: 1rem; color: #667eea;">Item-wise Sales</h3>';
    html += '<table><thead><tr><th>Item Name</th><th>Quantity Sold</th><th>Total Revenue</th></tr></thead><tbody>';
    
    sortedItems.forEach(([name, data]) => {
        html += `
            <tr>
                <td>${name}</td>
                <td>${data.quantity}</td>
                <td>₹${data.revenue.toFixed(2)}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

