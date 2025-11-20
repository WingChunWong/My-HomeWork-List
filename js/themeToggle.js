// 主题切换功能
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // 初始化主题状态
    function initTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            updateToggleIcon(true);
        } else {
            updateToggleIcon(false);
        }
    }

    // 更新切换按钮图标
    function updateToggleIcon(isDark) {
        const icon = themeToggle.querySelector('i');
        if (isDark) {
            icon.classList.remove('bi-moon');
            icon.classList.add('bi-sun');
        } else {
            icon.classList.remove('bi-sun');
            icon.classList.add('bi-moon');
        }
    }

    // 切换主题模式
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        updateToggleIcon(isDarkMode);
        
        // 触发表格和统计信息重新渲染以适应主题
        if (typeof applyFilters === 'function') {
            applyFilters();
        }
    }

    // 绑定事件
    themeToggle.addEventListener('click', toggleDarkMode);
    
    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', initTheme);
}

// 初始化主题切换
initializeThemeToggle();