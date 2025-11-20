// 主应用程序入口文件
// 负责初始化应用、绑定事件监听器及协调各模块工作

// 等待DOM完全加载后执行初始化操作
document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期选择器（默认选中今天）
    setTodayDate();
    
    // 加载数据相关资源
    loadLastUpdateTime();  // 加载最后更新时间
    loadHomeworkData();    // 加载家课数据
    
    // 绑定筛选器事件监听器
    document.getElementById('issueDateFilter').addEventListener('change', applyFilters);
    document.getElementById('subjectFilter').addEventListener('change', applyFilters);
    document.getElementById('dueStatusFilter').addEventListener('change', applyFilters);
    
    // 绑定重置和上传按钮事件
    document.getElementById('resetFilter').addEventListener('click', resetFilters);
    document.getElementById('uploadButton').addEventListener('click', handleFileUpload);
});