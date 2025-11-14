// 渲染家课表格
function renderHomeworkTable(data) {
    const container = document.getElementById('homeworkTableBody');
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
        let statusText = '';
        let statusIcon = '';
        
        if (dueDate < today) {
            statusClass = 'overdue';
            statusText = '已過期';
            statusIcon = 'exclamation-circle';
        } else if (dueDate.toDateString() === today.toDateString()) {
            statusClass = 'today';
            statusText = '今天到期';
            statusIcon = 'clock';
        } else {
            statusClass = 'normal';
            statusText = '進行中';
            statusIcon = 'arrow-right';
        }
        
        return `
            <tr class="${statusClass}">
                <td>${item.id}</td>
                <td>${item.subject}</td>
                <td>${item.homework_name}</td>
                <td>${item.issue_date}</td>
                <td>${item.due_date}</td>
                <td>${item.class_group}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        <i class="bi bi-${statusIcon} me-1"></i>${statusText}
                    </span>
                </td>
                <td>
                    <div class="homework-remarks">
                        ${item.remarks || '無備註'}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}
