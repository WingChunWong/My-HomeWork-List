# 線上家課表 (My-HomeWork-List)

一個用於管理和展示家庭作業的線上應用，支援資料爬取、篩選檢視和自動部署功能，幫助學生和家長更高效地跟蹤作業進度。


## 功能特點

- 📋 **家課清單展示**：清晰呈現作業的科目、名稱、發布日期、截止日期、組別和備註等資訊
- 🔍 **多條件篩選**：支持按發布日期、科目和到期狀態（已過期/今天到期/未來到期）快速篩選
- 📊 **實時統計**：自動計算並展示今日發布的家課數量和今天到期的家課數量
- 🤖 **自動爬取**：透過 Python 爬蟲腳本自動從指定來源獲取最新家課資料
- 🌐 **回應式設計**：适配電腦、平板和手機等不同設備的瀏覽體驗
- 🔄 **自動化流程**：通過 GitHub Actions 定期更新資料並自動部署到 GitHub Pages


## 項目結構

```
My-HomeWork-List/
├── index.html           # 主頁面（前端展示）
├── css/
│   ├── style.css        # 基礎樣式
│   └── responsive.css   # 響應式佈局樣式
├── js/
│   ├── main.js          # 主應用入口
│   ├── dataLoader.js    # 數據加載與文件上傳處理
│   ├── filter.js        # 篩選邏輯
│   ├── tableRenderer.js # 表格渲染
│   └── statistics.js    # 統計信息計算
├── homework_crawler.py  # 家課資料爬蟲腳本
├── homework_data.json   # 家課數據存儲（JSON格式）
├── homework_data.xlsx   # 家課數據備份（Excel格式）
├── last_update.json     # 最後更新時間記錄
├── requirements.txt     # Python依賴庫列表
├── LICENSE              # GPLv3 授權條款
└── .github/workflows/   # GitHub Actions 工作流配置
    ├── update-data.yml  # 定期更新數據的工作流
    ├── deploy.yml       # 部署到GitHub Pages的工作流
    └── test-crawler.yml # 爬蟲測試工作流
```


### 線上訪問

🌐[**體驗地址**](https://wingchunwong.github.io/My-HomeWork-List/)


## 自動化流程說明

項目通過 GitHub Actions 實現全自動化的數據更新和部署：

1. **定期更新**：每天 UTC 09:00（香港時間 17:00）自動運行爬蟲，獲取最新家課數據
2. **數據驗證**：檢查爬取的數據格式是否正確，確保 JSON 語法有效
3. **自動部署**：若數據有更新，自動提交更改並觸發部署流程，更新 GitHub Pages 網站
4. **手動觸發**：支持手動執行工作流，強制更新數據或重新部署

## 授權條款

本項目採用 [GNU General Public License v3.0](LICENSE) 授權協議。詳細條款請參見 LICENSE 文件。
