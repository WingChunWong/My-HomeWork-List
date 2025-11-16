// 家课数据存储
let homeworkData = [];

// 设置今天日期作为默认筛选日期
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

// 格式化日期为YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 加载最后更新时间
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
        
        fetch(path, { cache: 'no-store' })
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

// 更新最后更新时间显示
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

// 加载家课数据
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
        
        fetch(path, { cache: 'no-store' })
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

// 显示文件上传区域
function showUploadArea() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const uploadArea = document.getElementById('uploadArea');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
}

// 处理文件上传
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

// 处理家课数据
function processHomeworkData(data) {
    if (!Array.isArray(data)) {
        throw new Error('數據格式錯誤: 應為數組');
    }
    
    homeworkData = data;
    
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    const homeworkTableContainer = document.getElementById('homeworkTableContainer');
    if (homeworkTableContainer) homeworkTableContainer.style.display = 'block';
    
    populateSubjectFilter();
    applyFilters();
}
