/**
 * 渲染作業表格函數
 * 根據作業數據動態生成表格內容，並處理數據狀態展示（過期、今日到期、進行中）
 * @param {Array} data - 作業數據數組，每項包含id、subject、homework_name等字段
 */
function renderHomeworkTable(data) {
    // 獲取DOM元素
    const container = document.getElementById('homeworkTableBody');
    const noData = document.getElementById('noData');
    const filteredCount = document.getElementById('filteredCount');
    
    // 防錯處理：若DOM元素不存在則終止執行
    if (!container || !noData || !filteredCount) return;
    
    // 處理空數據場景
    if (data.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        filteredCount.textContent = '0 條記錄';
        return;
    }
    
    // 數據存在時顯示表格，更新統計數字
    noData.style.display = 'none';
    filteredCount.textContent = `${data.length} 條記錄`;
    
    // 遍歷數據生成表格行
    container.innerHTML = data.map(item => {
        // 處理日期邏輯：計算作業截止日期與當前日期的關係
        const dueDate = new Date(item.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 重置當天時間為0點，便於日期比較
        
        // 初始化狀態樣式、文本和圖標
        let statusClass = '';
        let statusText = '';
        let statusIcon = '';
        
        // 判斷作業狀態
        if (dueDate < today) {
            // 截止日期已過（過期）
            statusClass = 'overdue';
            statusText = '已過期';
            statusIcon = 'exclamation-circle';
        } else if (dueDate.toDateString() === today.toDateString()) {
            // 今天到期
            statusClass = 'today';
            statusText = '今天到期';
            statusIcon = 'clock';
        } else {
            // 正常進行中
            statusClass = 'normal';
            statusText = '進行中';
            statusIcon = 'arrow-right';
        }

        // 生成表格行HTML
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