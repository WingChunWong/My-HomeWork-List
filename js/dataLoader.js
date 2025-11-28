// 数据加载模块
// 负责家课数据的加载、解析、日期处理及文件上传功能

// 全局存储家课数据
let homeworkData = [];

/**
 * 设置日期筛选器默认值为今天
 * 若元素未立即加载，将重试获取
 */
function setTodayDate() {
    const issueDateFilter = document.getElementById('issueDateFilter');
    if (issueDateFilter) {
        const today = new Date();
        const formattedDate = formatDate(today);
        issueDateFilter.value = formattedDate;
    } else {
        // 延迟100ms重试（处理DOM加载时序问题）
        setTimeout(setTodayDate, 100);
    }
}

/**
 * 将日期对象格式化为YYYY-MM-DD字符串
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，补零至2位
    const day = String(date.getDate()).padStart(2, '0');        // 日期补零至2位
    return `${year}-${month}-${day}`;
}

/**
 * 加载最后更新时间信息
 * 尝试多种可能的文件路径，确保兼容性
 */
function loadLastUpdateTime() {
    // 可能的文件路径（适配不同部署环境）
    const possiblePaths = [
        'last_update.json',
        './last_update.json',
        'data/last_update.json',
        './data/last_update.json'
    ];
    
    /**
     * 递归尝试加载文件
     * @param {number} pathIndex - 当前尝试的路径索引
     */
    function tryLoad(pathIndex) {
        // 所有路径尝试失败时，使用当前时间作为默认值
        if (pathIndex >= possiblePaths.length) {
            const lastUpdate = document.getElementById('lastUpdate');
            if (lastUpdate) {
                lastUpdate.textContent = new Date().toLocaleString('zh-Hant');
            }
            return;
        }
        
        const path = possiblePaths[pathIndex];
        
        // 禁用缓存，确保获取最新数据
        fetch(path, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
                return response.json();
            })
            .then(data => updateLastUpdateDisplay(data)) // 成功则更新显示
            .catch(() => tryLoad(pathIndex + 1));       // 失败则尝试下一个路径
    }
    
    // 从第一个路径开始尝试
    tryLoad(0);
}

/**
 * 更新最后更新时间的显示格式
 * @param {Object} updateData - 包含最后更新时间的对象
 */
function updateLastUpdateDisplay(updateData) {
    const lastUpdate = document.getElementById('lastUpdate');
    if (!lastUpdate) return;
    
    if (updateData && updateData.last_updated) {
        try {
            const updateDate = new Date(updateData.last_updated);
            // 格式化显示为繁体中文 locale（年/月/日 时:分:秒）
            lastUpdate.textContent = updateDate.toLocaleString('zh-Hant', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false // 24小时制
            });
        } catch (e) {
            // 日期解析失败时，直接显示原始字符串
            lastUpdate.textContent = updateData.last_updated;
        }
    } else {
        // 无数据时显示当前时间
        lastUpdate.textContent = new Date().toLocaleString('zh-Hant');
    }
}

/**
 * 加载家课数据主函数
 * 尝试多种路径，失败时显示上传区域
 */
function loadHomeworkData() {
    const possiblePaths = [
        'homework_data.json',
        './homework_data.json',
        'data/homework_data.json',
        './data/homework_data.json'
    ];
    
    /**
     * 递归尝试加载家课数据文件
     * @param {number} pathIndex - 当前尝试的路径索引
     */
    function tryLoad(pathIndex) {
        if (pathIndex >= possiblePaths.length) {
            showUploadArea(); // 所有路径失败，显示文件上传区域
            return;
        }
        
        const path = possiblePaths[pathIndex];
        
        fetch(path, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
                return response.json();
            })
            .then(data => processHomeworkData(data)) // 成功则处理数据
            .catch(() => tryLoad(pathIndex + 1));   // 失败则尝试下一个路径
    }
    
    tryLoad(0);
}

/**
 * 显示文件上传区域（当数据加载失败时）
 */
function showUploadArea() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const uploadArea = document.getElementById('uploadArea');
    
    if (loadingSpinner) loadingSpinner.style.display = 'none'; // 隐藏加载动画
    if (uploadArea) uploadArea.style.display = 'block';       // 显示上传区域
}

/**
 * 处理用户上传的JSON文件
 */
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) {
        alert('文件输入元素未找到');
        return;
    }
    
    const file = fileInput.files[0];
    if (!file) {
        alert('请选择一个JSON文件');
        return;
    }
    
    // 验证文件类型
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        alert('请选择一个有效的JSON文件');
        return;
    }
    
    const reader = new FileReader();
    
    // 文件读取成功后的处理
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            processHomeworkData(data); // 处理上传的数据
            
            // 隐藏上传区域
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) uploadArea.style.display = 'none';
        } catch (error) {
            alert('解析JSON文件时出错: ' + error.message);
        }
    };
    
    // 读取错误处理
    reader.onerror = function() {
        alert('读取文件时出错');
    };
    
    // 以文本形式读取文件
    reader.readAsText(file);
}

/**
 * 处理家课数据（验证格式并初始化后续流程）
 * @param {Array} data - 家课数据数组
 * @throws {Error} 当数据格式不正确时抛出错误
 */
function processHomeworkData(data) {
    if (!Array.isArray(data)) {
        throw new Error('数据格式错误: 应为数组');
    }
    
    // 存储验证后的家课数据
    homeworkData = data;
    
    // 隐藏加载动画，显示表格容器
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    
    const homeworkTableContainer = document.getElementById('homeworkTableContainer');
    if (homeworkTableContainer) homeworkTableContainer.style.display = 'block';
    
    // 初始化筛选器并应用筛选
    populateSubjectFilter();
    applyFilters();
}