let homeworkData = [];

document.addEventListener('DOMContentLoaded', function() {
    setTodayDate();
    loadLastUpdateTime(); // 先加载最后更新时间
    loadHomeworkData();
    
    document.getElementById('issueDateFilter').addEventListener('change', applyFilters);
    document.getElementById('subjectFilter').addEventListener('change', applyFilters);
    document.getElementById('dueStatusFilter').addEventListener('change', applyFilters);
    document.getElementById('resetFilter').addEventListener('click', resetFilters);
    document.getElementById('uploadButton').addEventListener('click', handleFileUpload);
});

function setTodayDate() {
    const issueDateFilter = document.getElementById('issueDateFilter');
    if (issueDateFilter) {
        const today = new Date();
        const formattedDate = formatDate(today);
        issueDateFilter.value = formattedDate;
    } else {
        setTimeout(setTodayDate, 100);
    }
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function loadLastUpdateTime() {
    const possiblePaths = [
        'last_update.json',
        './last_update.json',
        'data/last_update.json',
        './data/last_update.json'
    ];
    
    function tryLoad(pathIndex) {
        if (pathIndex >= possiblePaths.length) {
            // 如果找不到最后更新文件，使用当前时间
            const lastUpdate = document.getElementById('lastUpdate');
            if (lastUpdate) {
                lastUpdate.textContent = new Date().toLocaleString('zh-Hant');
            }
            return;
        }
        
        const path = possiblePaths[pathIndex];
        
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                updateLastUpdateDisplay(data);
            })
            .catch(error => {
                tryLoad(pathIndex + 1);
            });
    }
    
    tryLoad(0);
}

function updateLastUpdateDisplay(updateData) {
    const lastUpdate = document.getElementById('lastUpdate');
    if (!lastUpdate) return;
    
    if (updateData && updateData.last_updated) {
        try {
            const updateDate = new Date(updateData.last_updated);
            lastUpdate.textContent = updateDate.toLocaleString('zh-Hant', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        } catch (e) {
            // 如果日期解析失败，使用原始字符串
            lastUpdate.textContent = updateData.last_updated;
        }
    } else {
        lastUpdate.textContent = new Date().toLocaleString('zh-Hant');
    }
}

function loadHomeworkData() {
    const possiblePaths = [
        'homework_data.json',
        './homework_data.json',
        'data/homework_data.json',
        './data/homework_data.json'
    ];
    
    let attempts = 0;
    
    function tryLoad(pathIndex) {
        if (pathIndex >= possiblePaths.length) {
            showUploadArea();
            return;
        }
        
        const path = possiblePaths[pathIndex];
        
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                processHomeworkData(data);
            })
            .catch(error => {
                tryLoad(pathIndex + 1);
            });
    }
    
    tryLoad(0);
}

function showUploadArea() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const uploadArea = document.getElementById('uploadArea');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
}

function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        alert('文件輸入元素未找到');
        return;
    }
    
    const file = fileInput.files[0];
    
    if (!file) {
        alert('請選擇一個JSON文件');
        return;
    }
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('請選擇一個有效的JSON文件');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            processHomeworkData(data);
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) uploadArea.style.display = 'none';
        } catch (error) {
            alert('解析JSON文件時出錯: ' + error.message);
        }
    };
    
    reader.onerror = function() {
        alert('讀取文件時出錯');
    };
    
    reader.readAsText(file);
}

function processHomeworkData(data) {
    if (!Array.isArray(data)) {
        throw new Error('數據格式錯誤: 應為數組');
    }
    
    homeworkData = data;
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    const homeworkCards = document.getElementById('homeworkCards');
    if (homeworkCards) homeworkCards.style.display = 'flex';
    
    populateSubjectFilter();
    applyFilters();
}

function populateSubjectFilter() {
    const subjectFilter = document.getElementById('subjectFilter');
    if (!subjectFilter) return;
    
    const subjects = [...new Set(homeworkData.map(item => item.subject))].sort();
    
    while (subjectFilter.children.length > 1) {
        subjectFilter.removeChild(subjectFilter.lastChild);
    }
    
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
}

function applyFilters() {
    const issueDateFilter = document.getElementById('issueDateFilter');
    const subjectFilter = document.getElementById('subjectFilter');
    const dueStatusFilter = document.getElementById('dueStatusFilter');
    
    if (!issueDateFilter || !subjectFilter || !dueStatusFilter) return;
    
    const issueDate = issueDateFilter.value;
    const subject = subjectFilter.value;
    const dueStatus = dueStatusFilter.value;
    
    const filteredData = homeworkData.filter(item => {
        if (issueDate && item.issue_date !== issueDate) {
            return false;
        }
        
        if (subject && item.subject !== subject) {
            return false;
        }
        
        if (dueStatus) {
            const dueDate = new Date(item.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dueStatus === 'overdue') {
                if (dueDate >= today) return false;
            } else if (dueStatus === 'today') {
                if (dueDate.toDateString() !== today.toDateString()) return false;
            } else if (dueStatus === 'future') {
                if (dueDate <= today) return false;
            }
        }
        
        return true;
    });
    
    renderHomeworkCards(filteredData);
    updateStatistics(filteredData);
}

function resetFilters() {
    const issueDateFilter = document.getElementById('issueDateFilter');
    const subjectFilter = document.getElementById('subjectFilter');
    const dueStatusFilter = document.getElementById('dueStatusFilter');
    
    if (issueDateFilter) issueDateFilter.value = '';
    if (subjectFilter) subjectFilter.value = '';
    if (dueStatusFilter) dueStatusFilter.value = '';
    
    applyFilters();
}

function renderHomeworkCards(data) {
    const container = document.getElementById('homeworkCards');
    const noData = document.getElementById('noData');
    const filteredCount = document.getElementById('filteredCount');
    
    if (!container || !noData || !filteredCount) return;
    
    if (data.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        filteredCount.textContent = '0 條記錄';
        return;
    }
    
    noData.style.display = 'none';
    filteredCount.textContent = `${data.length} 條記錄`;
    
    container.innerHTML = data.map(item => {
        const dueDate = new Date(item.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let statusClass = '';
        let statusIndicatorClass = '';
        let statusText = '';
        let statusIcon = '';
        
        if (dueDate < today) {
            statusClass = 'overdue';
            statusIndicatorClass = 'overdue';
            statusText = '已過期';
            statusIcon = 'exclamation-circle';
        } else if (dueDate.toDateString() === today.toDateString()) {
            statusClass = 'today';
            statusIndicatorClass = 'today';
            statusText = '今天到期';
            statusIcon = 'clock';
        } else {
            statusClass = 'normal';
            statusIndicatorClass = 'normal';
            statusText = '進行中';
            statusIcon = 'arrow-right';
        }
        
        return `
            <div class="col-12 mb-4">
                <div class="card homework-card horizontal ${statusClass}">
                    <div class="card-body">
                        <div class="homework-main">
                            <div class="homework-header">
                                <div class="homework-subject">${item.subject}</div>
                                <h5 class="homework-title">${item.homework_name}</h5>
                            </div>
                            
                            <div class="homework-meta">
                                <div class="meta-item">
                                    <i class="bi bi-calendar-event"></i>
                                    <span>發出: ${item.issue_date}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="bi bi-calendar-check"></i>
                                    <span>到期: ${item.due_date}</span>
                                </div>
                                <div class="meta-item">
                                    <i class="bi bi-people"></i>
                                    <span>組別: ${item.class_group}</span>
                                </div>
                            </div>
                            
                            <div class="homework-remarks">
                                ${item.remarks || '無備註'}
                            </div>
                        </div>
                        
                        <div class="homework-sidebar">
                            <div class="status-indicator ${statusIndicatorClass}">
                                <i class="bi bi-${statusIcon} me-2"></i>
                                <span>${statusText}</span>
                            </div>
                            
                            <div class="homework-footer">
                                <small class="text-muted">ID: ${item.id}</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateStatistics(data) {
    const totalCountElement = document.getElementById('totalCount');
    const dueTodayCountElement = document.getElementById('dueTodayCount');
    const overdueCountElement = document.getElementById('overdueCount');
    
    if (!totalCountElement || !dueTodayCountElement || !overdueCountElement) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalCount = homeworkData.length;
    const dueTodayCount = homeworkData.filter(item => {
        const dueDate = new Date(item.due_date);
        return dueDate.toDateString() === today.toDateString();
    }).length;
    
    const overdueCount = homeworkData.filter(item => {
        const dueDate = new Date(item.due_date);
        return dueDate < today;
    }).length;
    
    totalCountElement.textContent = totalCount;
    dueTodayCountElement.textContent = dueTodayCount;
    overdueCountElement.textContent = overdueCount;
}
