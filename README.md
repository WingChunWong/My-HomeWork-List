# 在线家课表 (My-HomeWork-List)

一个用于管理和展示家庭作业的在线应用，支持数据爬取、筛选查看和自动部署功能。

## 功能特点

- 📋 展示家课列表，包含科目、名称、发布日期、截止日期等信息
- 🔍 多条件筛选：可按发布日期、科目和到期状态（已过期/今天到期/未来到期）筛选
- 📊 统计信息展示：总家课数、今天到期数和已过期数
- 🤖 自动爬取：通过爬虫脚本自动获取家课数据
- 🌐 网页展示：响应式设计，适配不同设备
- 🔄 自动更新：通过GitHub Actions定期更新数据并部署

## 项目结构

```
My-HomeWork-List/
├── index.html           # 主页面
├── script.js            # 前端交互逻辑
├── style.css            # 样式表
├── homework_crawler.py  # 家课数据爬虫
├── homework_data.json   # 家课数据文件
├── requirements.txt     # Python依赖
├── LICENSE              # GPLv3许可证
└── .github/workflows/   # GitHub Actions工作流配置
```

## 本地使用

### 网页展示

1. 直接打开 `index.html` 文件即可在浏览器中查看
2. 如果本地没有 `homework_data.json` 文件，可手动上传JSON数据文件

### 数据爬取

1. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

2. 运行爬虫：
   ```bash
   python homework_crawler.py
   ```

3. 爬虫选项：
   ```bash
   python homework_crawler.py --clear  # 清除保存的凭据
   python homework_crawler.py --help   # 显示帮助信息
   ```

4. 凭据配置（优先级）：
   - 环境变量：`PORTAL_USERNAME` 和 `PORTAL_PASSWORD`
   - 本地配置文件：`portal_config.json`
   - 运行时手动输入

## 数据格式

`homework_data.json` 数据格式示例：
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

## 自动化部署

项目通过GitHub Actions实现自动化：

1. 定期爬取最新家课数据并更新
2. 自动部署到GitHub Pages
3. 包含数据验证和测试步骤

## 许可证

本项目采用 [GNU General Public License v3.0](LICENSE) 许可协议。
