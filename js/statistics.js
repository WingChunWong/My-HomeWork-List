// 更新统计信息
function updateStatistics(data) {
    const issuedTodayCountElement = document.getElementById('issuedTodayCount');
    const dueTodayCountElement = document.getElementById('dueTodayCount');
    
    if (!issuedTodayCountElement || !dueTodayCountElement) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const issuedTodayCount = homeworkData.filter(item => {
        const issueDate = new Date(item.issue_date);
        return issueDate.toDateString() === today.toDateString();
    }).length;
    
    const dueTodayCount = homeworkData.filter(item => {
        const dueDate = new Date(item.due_date);
        return dueDate.toDateString() === today.toDateString();
    }).length;
    
    issuedTodayCountElement.textContent = issuedTodayCount;
    dueTodayCountElement.textContent = dueTodayCount;
}
