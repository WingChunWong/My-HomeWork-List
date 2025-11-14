// 主应用程序入口
document.addEventListener('DOMContentLoaded', function() {
    // 初始化日期选择器
    setTodayDate();
    
    // 加载数据
    loadLastUpdateTime();
    loadHomeworkData();
    
    // 绑定事件监听器
    document.getElementById('issueDateFilter').addEventListener('change', applyFilters);
    document.getElementById('subjectFilter').addEventListener('change', applyFilters);
    document.getElementById('dueStatusFilter').addEventListener('change', applyFilters);
    document.getElementById('resetFilter').addEventListener('click', resetFilters);
    document.getElementById('uploadButton').addEventListener('click', handleFileUpload);
});
