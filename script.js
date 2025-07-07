let tabs = [{ id: 0, name: 'Tab 1', data: [] }];
let currentTab = 0;
let editIndex = -1;

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function initializeData() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const themeLink = document.getElementById('theme-link');
        themeLink.href = savedTheme === 'dark' ? 'theme-dark.css' : 'theme-light.css';

        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }

        if (!localStorage.getItem('tabs')) {
            tabs[0].data = [
                { machineData: 'Machine A', period: 'Jan', status: 'Done', notes: 'Initial check' },
                { machineData: 'Machine B', period: 'Feb', status: 'Outstanding', notes: '' }
            ];
            saveToLocalStorage();
        } else {
            loadFromLocalStorage();
        }

        renderTabs();
        renderTable();
        updateStats();
        updateRemoveTabButton();
        updateHeaderTitle();
    } catch (error) {
        console.error('Error initializing data:', error);
        alert('Failed to initialize data. Check console for details.');
    }
}

function toggleTheme() {
    try {
        const themeLink = document.getElementById('theme-link');
        const body = document.body;
        const currentTheme = localStorage.getItem('theme') || 'light';

        if (currentTheme === 'light') {
            themeLink.href = 'theme-dark.css';
            body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            themeLink.href = 'theme-light.css';
            body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    } catch (error) {
        console.error('Error toggling theme:', error);
        alert('Failed to toggle theme. Check console for details.');
    }
}

function addTab() {
    if (tabs.length >= 5) {
        alert('Maximum 5 tabs allowed!');
        return;
    }
    const newTab = { id: tabs.length, name: `Tab ${tabs.length + 1}`, data: [] };
    tabs.push(newTab);
    switchTab(tabs.length - 1);
    saveToLocalStorage();
}

function removeTab() {
    if (currentTab === 0) {
        alert('Cannot delete first tab!');
        return;
    }
    if (confirm('Delete this tab?')) {
        tabs.splice(currentTab, 1);
        switchTab(0);
        saveToLocalStorage();
    }
}

function switchTab(index) {
    currentTab = index;
    renderTabs();
    renderTable();
    updateStats();
    updateRemoveTabButton();
    updateHeaderTitle();
}

function renameTab() {
    document.getElementById('renameModal').style.display = 'flex';
    document.getElementById('newTabName').value = tabs[currentTab].name;
    document.getElementById('newTabName').focus();
}

function closeRenameModal() {
    document.getElementById('renameModal').style.display = 'none';
}

function confirmRenameTab() {
    const loader = document.getElementById('renameLoader');
    loader.style.display = 'block';
    
    setTimeout(() => {
        const newName = document.getElementById('newTabName').value.trim();
        
        if (!newName) {
            alert('Tab name cannot be empty!');
            loader.style.display = 'none';
            return;
        }
        
        tabs[currentTab].name = newName;
        saveToLocalStorage();
        renderTabs();
        updateHeaderTitle();
        closeRenameModal();
        loader.style.display = 'none';
    }, 500);
}

function updateHeaderTitle() {
    document.querySelector('h1').textContent = tabs[currentTab].name;
}

function updateRemoveTabButton() {
    document.getElementById('removeTabBtn').style.display = currentTab === 0 ? 'none' : 'inline-block';
}

function renderTabs() {
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = '';
    tabs.forEach((tab, index) => {
        const tabElement = document.createElement('div');
        tabElement.className = `tab ${currentTab === index ? 'active' : ''}`;
        tabElement.textContent = tab.name;
        tabElement.onclick = () => switchTab(index);
        tabsContainer.appendChild(tabElement);
    });
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    tabs[currentTab].data.forEach((item, index) => {
        if (!item || !item.machineData || !item.period || !item.status) return;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <span class="machine-data ${item.notes && item.notes.trim() ? 'has-notes' : ''}"
                    onclick="showEditModal(${index})"
                    title="Click to edit machine name & notes">
                    ${item.machineData}
                </span>
                ${item.notes && item.notes.trim() ? `<span class="notes-marquee">${item.notes}</span>` : ''}
            </td>
            <td>
                <select onchange="updatePeriod(${index}, this.value)">
                    ${monthOrder.map(month => `<option value="${month}" ${item.period === month ? 'selected' : ''}>${month}</option>`).join('')}
                </select>
            </td>
            <td>
                <select onchange="updateStatus(${index}, this.value)" class="status-${item.status.toLowerCase()}">
                    <option value="Done" ${item.status === 'Done' ? 'selected' : ''}>Done</option>
                    <option value="Outstanding" ${item.status === 'Outstanding' ? 'selected' : ''}>Outstanding</option>
                </select>
            </td>
            <td>
                <button class="delete-btn" onclick="deleteData(${index})" title="Delete Data">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats() {
    const data = tabs[currentTab].data;
    const total = data.length;
    const done = data.filter(item => item.status === 'Done').length;
    const outstanding = total - done;

    document.getElementById('totalStat').textContent = total;
    document.getElementById('doneStat').textContent = done;
    document.getElementById('outstandingStat').textContent = outstanding;
}

function showAddModal() {
    editIndex = -1;
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Add Data';
    document.getElementById('machineData').value = '';
    document.getElementById('notes').value = '';
    document.getElementById('machineData').disabled = false;
}

function showEditModal(index) {
    editIndex = index;
    const item = tabs[currentTab].data[index];
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent = 'Edit Data';
    document.getElementById('machineData').value = item.machineData;
    document.getElementById('notes').value = item.notes || '';
    document.getElementById('machineData').disabled = false;
}

function updatePeriod(index, value) {
    tabs[currentTab].data[index].period = value;
    saveToLocalStorage();
    renderTable();
    updateStats();
}

function updateStatus(index, value) {
    tabs[currentTab].data[index].status = value;
    saveToLocalStorage();
    renderTable();
    updateStats();
}

function closeModal() {
    document.getElementById('addModal').style.display = 'none';
}

function saveData() {
    const loader = document.getElementById('loader');
    loader.style.display = 'block';
    setTimeout(() => {
        const machineData = document.getElementById('machineData').value;
        const notes = document.getElementById('notes').value;

        if (!machineData && editIndex === -1) {
            alert('Machine Data is required!');
            loader.style.display = 'none';
            return;
        }

        if (editIndex === -1) {
            tabs[currentTab].data.push({
                machineData,
                period: 'Jan',
                status: 'Outstanding',
                notes
            });
        } else {
            tabs[currentTab].data[editIndex].machineData = machineData;
            tabs[currentTab].data[editIndex].notes = notes;
        }

        saveToLocalStorage();
        renderTable();
        updateStats();
        closeModal();
        loader.style.display = 'none';
    }, 500);
}

function deleteData(index) {
    if (confirm('Delete this data?')) {
        tabs[currentTab].data.splice(index, 1);
        saveToLocalStorage();
        renderTable();
        updateStats();
    }
}

function deleteAll() {
    if (confirm('Delete all data in this tab?')) {
        tabs[currentTab].data = [];
        saveToLocalStorage();
        renderTable();
        updateStats();
    }
}

function resetStatus() {
    if (confirm('Reset all status to Outstanding?')) {
        tabs[currentTab].data.forEach(item => item.status = 'Outstanding');
        saveToLocalStorage();
        renderTable();
        updateStats();
    }
}

function sortByPeriod() {
    tabs[currentTab].data.sort((a, b) => {
        return monthOrder.indexOf(a.period) - monthOrder.indexOf(b.period);
    });
    saveToLocalStorage();
    renderTable();
    updateStats();
}

function exportData() {
    const data = tabs[currentTab].data;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-tab-${currentTab + 1}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData) && importedData.every(item =>
                item.machineData && typeof item.machineData === 'string' &&
                monthOrder.includes(item.period) &&
                ['Done', 'Outstanding'].includes(item.status)
            )) {
                if (confirm('Import data will replace current tab data. Continue?')) {
                    tabs[currentTab].data = importedData;
                    saveToLocalStorage();
                    renderTable();
                    updateStats();
                }
            } else {
                alert('Invalid JSON format or data structure!');
            }
        } catch (error) {
            console.error('Error reading JSON file:', error);
            alert('Error reading JSON file: ' + error.message);
        }
        document.getElementById('importFile').value = '';
    };
    reader.readAsText(file);
}

function saveToLocalStorage() {
    localStorage.setItem('tabs', JSON.stringify(tabs));
    const theme = document.getElementById('theme-link').href.includes('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

function loadFromLocalStorage() {
    const savedTabs = localStorage.getItem('tabs');
    if (savedTabs) {
        tabs = JSON.parse(savedTabs);
        tabs.forEach(tab => {
            if (!tab.data) tab.data = [];
            tab.data = tab.data.filter(item =>
                item && item.machineData && typeof item.machineData === 'string' &&
                monthOrder.includes(item.period) &&
                ['Done', 'Outstanding'].includes(item.status)
            );
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeData);