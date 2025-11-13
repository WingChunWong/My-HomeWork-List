# 線上家課表 (My-HomeWork-List)

一個用於管理和展示家庭作業的線上應用，支援資料爬取、篩選檢視和自動部署功能。

## 功能特點

- 📋 展示家課清單，包含科目、名稱、發布日期、截止日期等資訊

- 🔍 多條件篩選：可按發布日期、科目和到期狀態（已過期/今天到期/未來到期）篩選

- 📊 統計資訊展示：總家課數、今天到期數和已過期數

- 🤖 自動爬取：透過爬蟲腳本自動獲取家課資料

- 🌐 網頁展示：回應式設計，適配不同裝置

- 🔄 自動更新：透過GitHub Actions定期更新資料並部署

## 專案結構

```
My-HomeWork-List/
├── index.html           # 主頁面
├── script.js            # 前端互動邏輯
├── style.css            # 樣式表
├── homework_crawler.py  # 家課資料爬蟲
├── homework_data.json   # 家課資料檔案
├── requirements.txt     # Python依賴
├── LICENSE              # GPLv3授權條款
└── .github/workflows/   # GitHub Actions工作流程設定
```

## 本機使用

### 網頁展示

1. 直接開啟 `index.html` 檔案即可在瀏覽器中檢視

2. 若本機沒有 `homework_data.json` 檔案，可手動上傳JSON資料檔案

### 資料爬取

1. 安裝依賴：

    ```bash
   pip install -r requirements.txt
   ```

3. 執行爬蟲：

    ```bash
   python homework_crawler.py
   ```

4. 爬蟲選項：

   ```bash
   python homework_crawler.py --clear  # 清除儲存的憑證
   python homework_crawler.py --help   # 顯示說明資訊
   ```

5. 憑證設定（優先順序）：

   - 環境變數：`PORTAL_USERNAME` 和 `PORTAL_PASSWORD`
   - 本機設定檔案：`portal_config.json`
   - 執行時手動輸入

## 資料格式

`homework_data.json` 資料格式範例：

```json
[
  {
    "id": "73192",
    "issue_date": "2025-10-02",
    "due_date": "2025-10-03",
    "class_group": "全班",
    "subject": "歷史 -- HIST",
    "homework_name": "明交工作紙及VLE",
    "remarks": ""
  }
]
```

## 自動化部署

專案透過GitHub Actions實現自動化：

1. 定期爬取最新家課資料並更新
2. 自動部署到GitHub Pages
3. 包含資料驗證和測試步驟

## 授權條款

本專案採用 [GNU General Public License v3.0](LICENSE) 授權協議。
