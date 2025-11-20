function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // 添加ARIA属性提升可访问性
    themeToggle.setAttribute('aria-label', '切换深色/浅色模式');
    themeToggle.setAttribute('role', 'switch');

    // 初始化主题状态
    function initTheme() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        updateToggleState(isDarkMode);
    }

    // 更新切换按钮状态（图标+ARIA）
    function updateToggleState(isDark) {
        const icon = themeToggle.querySelector('i');
        // 移除所有图标类并添加过渡效果
        icon.className = 'bi transition-all duration-300 ease-in-out';
        
        if (isDark) {
            icon.classList.add('bi-sun', 'text-yellow-300', 'scale-110');
            themeToggle.setAttribute('aria-checked', 'true');
        } else {
            icon.classList.add('bi-moon', 'text-blue-200');
            themeToggle.setAttribute('aria-checked', 'false');
        }
    }

    // 切换主题模式（添加平滑过渡）
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        // 添加主题切换时的页面过渡效果
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
        updateToggleState(isDarkMode);
        
        // 触发表格重新渲染以适应主题
        if (typeof applyFilters === 'function') {
            applyFilters();
        }
    }

    // 绑定事件（添加点击反馈）
    themeToggle.addEventListener('click', toggleDarkMode);
    themeToggle.addEventListener('mousedown', () => {
        themeToggle.classList.add('active');
    });
    themeToggle.addEventListener('mouseup', () => {
        themeToggle.classList.remove('active');
    });
    themeToggle.addEventListener('mouseleave', () => {
        themeToggle.classList.remove('active');
    });
    
    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', initTheme);
}

// 初始化主题切换
initializeThemeToggle();