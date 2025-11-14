// 填充科目筛选器
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

// 应用筛选器
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
    
    renderHomeworkTable(filteredData);
    updateStatistics(filteredData);
}

// 重置筛选器
function resetFilters() {
    const subjectFilter = document.getElementById('subjectFilter');
    const dueStatusFilter = document.getElementById('dueStatusFilter');
    const issueDateFilter = document.getElementById('issueDateFilter');
    
    if (subjectFilter) subjectFilter.value = '';
    if (dueStatusFilter) dueStatusFilter.value = '';
    if (issueDateFilter) {
        const today = new Date();
        issueDateFilter.value = formatDate(today); // 使用已有的formatDate函数格式化日期
    }
    
    applyFilters();
}
