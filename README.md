# 線上家課表 (My-HomeWork-List)

一個用於管理和展示家庭作業的線上應用，支援資料爬取、篩選檢視和自動部署功能，幫助用戶高效追蹤家課進度。

## ✨ 功能特點

- 📋 **家課清單展示**：清晰呈現家課的科目、名稱、發布日期、截止日期、組別及備註等資訊
- 🔍 **多條件篩選**：支援按「發布日期」「科目」「到期狀態（已過期/今天到期/未來到期）」組合篩選
- 📊 **即時統計**：自動計算「今日發布家課數」和「今天到期家課數」，直觀掌握任務節奏
- 🤖 **自動爬取**：透過爬蟲腳本自動抓取最新家課資料，減少手動輸入成本
- 🌐 **回應式設計**：适配電腦、平板和手機等不同裝置，隨時隨地查看
- 🔄 **自動化流程**：依賴 GitHub Actions 實現定期更新資料和自動部署，確保數據即時性

## 📁 專案結構

```
My-HomeWork-List/
├── index.html           # 主頁面（家課展示與互動）
├── css/
│   ├── style.css        # 基礎樣式
│   └── responsive.css   # 回應式布局樣式
├── js/
│   ├── main.js          # 應用入口（初始化與事件綁定）
│   ├── dataLoader.js    # 資料加載與文件上傳處理
│   ├── filter.js        # 篩選邏輯實現
│   ├── tableRenderer.js # 家課表格動態渲染
│   └── statistics.js    # 統計資訊計算與更新
├── homework_crawler.py  # 家課資料爬蟲腳本
├── homework_data.json   # 家課資料存儲（JSON格式）
├── last_update.json     # 最後更新時間記錄
├── requirements.txt     # Python依賴清單
├── LICENSE              # GPLv3 授權條款
└── .github/workflows/   # GitHub Actions 工作流配置
    ├── update-date.yml  # 定期更新家課資料
    ├── deploy.yml       # 自動部署到 GitHub Pages
    └── test-crawler.yml # 爬蟲功能測試
```

## 🔄 自動化流程

專案透過 GitHub Actions 實現全自動化管理，核心流程包括：

1. **定期更新**：每天 UTC 09:00（香港時間 17:00）自動運行爬蟲，抓取最新家課資料
2. **資料驗證**：檢查爬取的 JSON 資料格式有效性，確保數據正確
3. **自動部署**：若資料有更新，自動觸發部署流程，更新 GitHub Pages 上的內容
4. **手動觸發**：支持手動運行工作流強制更新，適用於緊急情況


## 📜 授權條款

本專案採用 [GNU General Public License v3.0](LICENSE) 授權協議，允許自由使用、修改和分享，但需遵守協議中的版權保護與開源義務。
