import requests  # type: ignore
from bs4 import BeautifulSoup  # type: ignore
import pandas as pd # type: ignore
import os
import re
import time
import json
import getpass
import sys
from datetime import datetime, timedelta
from colorama import init, Fore, Style  # type: ignore

# 初始化colorama（用于彩色终端输出）
init(autoreset=True)

class ColorLogger:
    """彩色日志输出类 - 用于在控制台显示不同颜色的日志信息"""
    
    @staticmethod
    def info(message):
        print(f"{Fore.CYAN}[摘要]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def success(message):
        print(f"{Fore.GREEN}[成功]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def warning(message):
        print(f"{Fore.YELLOW}[警告]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def error(message):
        print(f"{Fore.RED}[错误]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def debug(message):
        print(f"{Fore.BLUE}[调试]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def progress(message, current, total):
        """显示进度信息"""
        percent = (current / total) * 100
        print(f"{Fore.MAGENTA}[进行中]{Style.RESET_ALL} {message} ({current}/{total} {percent:.1f}%)")

class ConfigManager:
    """配置管理器 - 处理用户凭据的存储和读取"""
    
    CONFIG_FILE = "portal_config.json"  # 配置文件名称
    
    @classmethod
    def load_config(cls):
        """加载配置文件"""
        if os.path.exists(cls.CONFIG_FILE):
            try:
                with open(cls.CONFIG_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                ColorLogger.warning(f"配置文件损坏: {e}")
        return {}  # 如果文件不存在或损坏，返回空字典
    
    @classmethod
    def save_config(cls, config):
        """保存配置文件"""
        try:
            with open(cls.CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            ColorLogger.success("配置已保存")
        except Exception as e:
            ColorLogger.error(f"保存配置失败: {e}")
    
    @classmethod
    def get_credentials(cls):
        """获取登录凭据 - 优先级：环境变量 > 配置文件 > 用户输入"""
        config = cls.load_config()
        
        # 首先尝试环境变量
        env_username = os.getenv('PORTAL_USERNAME')
        env_password = os.getenv('PORTAL_PASSWORD')
        
        if env_username and env_password:
            ColorLogger.info("使用环境变量中的凭据")
            return env_username, env_password
        
        # 然后尝试配置文件
        if config.get('username') and config.get('password'):
            ColorLogger.info("使用配置文件中的凭据")
            return config['username'], config['password']
        
        # 最后提示用户输入
        ColorLogger.warning("未找到保存的登录凭据")
        return cls.prompt_for_credentials()
    
    @classmethod
    def prompt_for_credentials(cls):
        """提示用户输入凭据"""
        ColorLogger.info("请输入门户网站登录信息")
        
        username = input(f"{Fore.CYAN}用户名: {Style.RESET_ALL}").strip()
        password = getpass.getpass(f"{Fore.CYAN}密码: {Style.RESET_ALL}").strip()  # 使用getpass隐藏密码输入
        
        if not username or not password:
            ColorLogger.error("用户名和密码不能为空")
            return None, None
        
        # 询问是否保存凭据到本地
        save = input(f"{Fore.YELLOW}是否保存凭据到本地配置文件? (y/N): {Style.RESET_ALL}").strip().lower()
        if save in ['y', 'yes']:
            config = cls.load_config()
            config.update({
                'username': username,
                'password': password,
                'last_updated': datetime.now().isoformat()
            })
            cls.save_config(config)
        
        return username, password
    
    @classmethod
    def clear_credentials(cls):
        """清除保存的凭据"""
        if os.path.exists(cls.CONFIG_FILE):
            os.remove(cls.CONFIG_FILE)
            ColorLogger.success("已清除保存的凭据")
        else:
            ColorLogger.warning("没有找到保存的凭据")

def login_to_portal(username, password):
    """登录门户网站获取session"""
    login_url = "https://portal.frcss.edu.hk/user.php?op=login"
    session = requests.Session()  # 创建会话对象，保持登录状态
    
    # 设置请求头，模拟浏览器行为
    session.headers.update({
        'Accept-encoding': 'gzip, deflate, br, zstd',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://portal.frcss.edu.hk',
        'Referer': 'https://portal.frcss.edu.hk/modules/my/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Connection': 'keep-alive'
    })
    
    try:
        ColorLogger.info("正在获取登录页面...")
        response = session.get(login_url)
        
        # 构造登录表单数据
        login_data = {
            'uname': username,
            'pass': password,
            'op': 'login',
            'xoops_redirect': '',
            'from': 'profile'
        }
        
        ColorLogger.info(f"使用账号: {Fore.WHITE}{username}{Style.RESET_ALL} 登录...")
        ColorLogger.info("正在提交登录表单...")
        
        # 提交登录请求
        login_response = session.post(
            login_url, 
            data=login_data, 
            allow_redirects=True,
            headers={
                'Referer': login_url,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        
        ColorLogger.debug(f"登录响应状态码: {login_response.status_code}")
        
        response_text = login_response.text
        
        # 检查登录是否成功（通过页面内容判断）
        if '登入' in response_text and '帳號' in response_text:
            ColorLogger.error("登录失败：用户名或密码错误")
            return None
        else:
            ColorLogger.success("登录成功！")
            
            # 测试访问家课页面确认登录状态
            test_url = "https://portal.frcss.edu.hk/modules/clsrm/?md=hw"
            test_response = session.get(test_url)
            if test_response.status_code == 200:
                ColorLogger.success("成功访问家课页面，登录状态确认")
            else:
                ColorLogger.warning(f"访问家课页面失败，状态码: {test_response.status_code}")
            
            return session  # 返回保持登录状态的session对象
            
    except Exception as e:
        ColorLogger.error(f"登录过程中出错: {e}")
        return None

def clean_subject_name(subject_text):
    """清理科目名称 - 处理重复的英文代码"""
    pattern = r'(.+?) -- ([A-Z]+)'
    match = re.match(pattern, subject_text)
    
    if match:
        chinese_name = match.group(1).strip()
        english_code = match.group(2).strip()
        
        # 处理重复的英文代码（如：CHINCHIN -> CHIN）
        if len(english_code) % 2 == 0:
            half_length = len(english_code) // 2
            if english_code[:half_length] == english_code[half_length:]:
                english_code = english_code[:half_length]
        
        return f"{chinese_name} -- {english_code}"
    return subject_text

def get_homework_by_date(session, date_str):
    """获取指定日期的家课数据"""
    ajax_url = "https://portal.frcss.edu.hk/modules/clsrm/clsrm_hw_oper.php"
    
    # 构造AJAX请求数据
    data = {
        'oper': 'hw_tbl',
        'slt_term': '1',  # 学期
        'slt_subj': '',   # 科目（空表示所有科目）
        'slt_date': date_str,  # 查询日期
        'slt_tide': 'create'   # 查询类型
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://portal.frcss.edu.hk/modules/clsrm/?md=hw',
        'X-Requested-With': 'XMLHttpRequest',  # 标识为AJAX请求
        'Origin': 'https://portal.frcss.edu.hk'
    }
    
    try:
        ColorLogger.info(f"正在获取 {Fore.WHITE}{date_str}{Style.RESET_ALL} 的家课数据...")
        response = session.post(ajax_url, data=data, headers=headers)
        
        if response.status_code != 200:
            ColorLogger.error(f"请求失败，状态码: {response.status_code}")
            return None
            
        try:
            result = response.json()  # 解析JSON响应
            html_content = result.get('html')
            if html_content:
                ColorLogger.success(f"成功获取到 {Fore.WHITE}{date_str}{Style.RESET_ALL} 的家课数据")
            else:
                ColorLogger.info(f"{Fore.WHITE}{date_str}{Style.RESET_ALL} 没有家课数据")
            return html_content
        except ValueError as e:
            ColorLogger.error(f"JSON解析失败: {e}")
            return None
            
    except Exception as e:
        ColorLogger.error(f"获取 {date_str} 家课数据失败: {e}")
        return None

def parse_homework_data(html_content):
    """解析家课表HTML内容，提取结构化数据"""
    if not html_content:
        return []
        
    soup = BeautifulSoup(html_content, 'html.parser')
    homework_data = []
    homework_table = soup.find('table', {'id': 'hw_table'})  # 查找家课表格
    
    if homework_table:
        rows = homework_table.find_all('tr')[1:]  # 跳过表头行
        for row in rows:
            cells = row.find_all('td')
            if len(cells) >= 7:  # 确保有足够的列
                homework_data.append({
                    'id': cells[0].get_text(strip=True),  # 家课ID
                    'issue_date': cells[1].get_text(strip=True),  # 发布日期
                    'due_date': cells[2].get_text(strip=True),  # 截止日期
                    'class_group': cells[3].get_text(strip=True),  # 班级/组别
                    'subject': clean_subject_name(cells[4].get_text(strip=True)),  # 科目（清理后）
                    'homework_name': cells[5].get_text(strip=True),  # 家课名称
                    'remarks': cells[6].get_text(strip=True),  # 备注
                })
        ColorLogger.success(f"获取到 {Fore.WHITE}{len(homework_data)}{Style.RESET_ALL} 条家课记录")
    else:
        ColorLogger.warning("未找到家课表格")
    
    return homework_data

def get_date_range():
    """获取从9月1日到今天的日期范围（学年通常从9月开始）"""
    current_year = datetime.now().year
    start_date = datetime(current_year, 9, 1)  # 9月1日
    end_date = datetime.now()
    
    date_list = []
    current_date = start_date
    while current_date <= end_date:
        date_list.append(current_date.strftime('%Y-%m-%d'))
        current_date += timedelta(days=1)
    
    return date_list

def save_data(homework_data):
    """保存数据到JSON和Excel文件"""
    if not homework_data:
        ColorLogger.warning("没有数据可保存")
        return
    
    # 保存为JSON文件（便于程序读取）
    with open('homework_data.json', 'w', encoding='utf-8') as f:
        json.dump(homework_data, f, ensure_ascii=False, indent=2)
    
    # 保存为Excel文件（便于用户查看）
    df = pd.DataFrame(homework_data)
    if 'due_date' in df.columns:
        df['due_date'] = pd.to_datetime(df['due_date'], errors='coerce')  # 转换日期格式
        df = df.sort_values('due_date')  # 按截止日期排序
    df.to_excel('homework_data.xlsx', index=False, engine='openpyxl')
    
    ColorLogger.success(f"数据已保存: {Fore.WHITE}{len(homework_data)}{Style.RESET_ALL} 条记录")

def main(force_full_update=False):
    """主函数
    Args:
        force_full_update: 是否强制完整更新所有数据
    """
    # 获取凭据
    username, password = ConfigManager.get_credentials()
    
    if not username or not password:
        ColorLogger.error("无法获取登录凭据，程序退出")
        return []
    
    # 登录门户网站
    session = login_to_portal(username, password)
    if not session:
        ColorLogger.error("登录失败，无法继续获取数据")
        return []
    
    # 检查是否需要强制完整更新
    if force_full_update:
        ColorLogger.info(f"{Fore.YELLOW}强制完整更新模式已启用{Style.RESET_ALL}")
        ColorLogger.info("将重新获取从9月1日到现在的所有家课数据...")
        date_list = get_date_range()
        ColorLogger.info(f"将查询 {Fore.WHITE}{len(date_list)}{Style.RESET_ALL} 天的家课数据")
        
        homework_data = []
        for i, date_str in enumerate(date_list):
            ColorLogger.progress(f"查询 {Fore.WHITE}{date_str}{Style.RESET_ALL} 的家课数据", i + 1, len(date_list))
            
            homework_html = get_homework_by_date(session, date_str)
            if homework_html:
                daily_homework = parse_homework_data(homework_html)
                homework_data.extend(daily_homework)
            
            time.sleep(1)  # 添加延时避免请求过快
    
    # 增量更新模式（默认）
    elif os.path.exists('homework_data.json'):
        ColorLogger.info("检测到已存在数据，更新今天的数据...")
        try:
            with open('homework_data.json', 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            existing_ids = {item['id'] for item in existing_data if 'id' in item}  # 获取现有数据的ID集合
        except Exception as e:
            ColorLogger.error(f"读取现有数据失败: {e}")
            existing_data = []
            existing_ids = set()
        
        # 只获取今天的数据
        today = datetime.now().strftime('%Y-%m-%d')
        homework_html = get_homework_by_date(session, today)
        new_homework = parse_homework_data(homework_html) if homework_html else []
        
        # 过滤掉已存在的数据
        new_count = 0
        for item in new_homework:
            if item['id'] not in existing_ids:
                existing_data.append(item)
                new_count += 1
        
        homework_data = existing_data
        ColorLogger.success(f"新增 {Fore.WHITE}{new_count}{Style.RESET_ALL} 条记录")
    
    # 首次运行模式
    else:
        ColorLogger.info("首次运行，获取从9月1日到现在的所有家课数据...")
        date_list = get_date_range()
        ColorLogger.info(f"将查询 {Fore.WHITE}{len(date_list)}{Style.RESET_ALL} 天的家课数据")
        
        homework_data = []
        for i, date_str in enumerate(date_list):
            ColorLogger.progress(f"查询 {Fore.WHITE}{date_str}{Style.RESET_ALL} 的家课数据", i + 1, len(date_list))
            
            homework_html = get_homework_by_date(session, date_str)
            if homework_html:
                daily_homework = parse_homework_data(homework_html)
                homework_data.extend(daily_homework)
            
            time.sleep(1)  # 添加延时避免请求过快
    
    # 保存数据
    if homework_data:
        save_data(homework_data)
    else:
        ColorLogger.warning("没有获取到家课数据")
    
    return homework_data

def show_help():
    """显示爬虫工具的使用帮助信息"""
    print(f"""
{Fore.YELLOW}家课数据爬虫使用说明{Style.RESET_ALL}

{Fore.CYAN}使用方法:{Style.RESET_ALL}
  python homework_crawler.py                           # 正常运行爬虫（增量更新）
  python homework_crawler.py --force-full-update/-ffu  # 强制完整更新所有数据
  python homework_crawler.py --clear                   # 清除保存的凭据
  python homework_crawler.py --help/-h                 # 显示此帮助信息

{Fore.CYAN}GitHub Actions 参数:{Style.RESET_ALL}
  在GitHub Actions中，可通过设置 inputs.force_full_update 为 true 触发强制完整更新

{Fore.CYAN}凭据获取优先级:{Style.RESET_ALL}
  1. 环境变量 (PORTAL_USERNAME, PORTAL_PASSWORD)
  2. 本地配置文件 (portal_config.json)
  3. 用户交互输入

{Fore.CYAN}环境变量设置方法:{Style.RESET_ALL}

{Fore.GREEN}Windows (命令提示符):{Style.RESET_ALL}
  set PORTAL_USERNAME=your_username
  set PORTAL_PASSWORD=your_password
  
{Fore.GREEN}Windows (PowerShell):{Style.RESET_ALL}
  $env:PORTAL_USERNAME="your_username"
  $env:PORTAL_PASSWORD="your_password"
  
{Fore.GREEN}Linux/macOS (bash/zsh):{Style.RESET_ALL}
  export PORTAL_USERNAME="your_username"
  export PORTAL_PASSWORD="your_password"
  
{Fore.GREEN}永久设置 (Linux/macOS):{Style.RESET_ALL}
  将以下内容添加到 ~/.bashrc 或 ~/.zshrc 文件中：
  export PORTAL_USERNAME="your_username"
  export PORTAL_PASSWORD="your_password"
  然后运行: source ~/.bashrc 或 source ~/.zshrc
  
{Fore.GREEN}永久设置 (Windows):{Style.RESET_ALL}
  1. 右键"此电脑" -> "属性" -> "高级系统设置"
  2. 点击"环境变量"按钮
  3. 在"用户变量"或"系统变量"中新建变量：
     - 变量名: PORTAL_USERNAME, 变量值: your_username
     - 变量名: PORTAL_PASSWORD, 变量值: your_password
  
{Fore.GREEN}在Python脚本中临时设置:{Style.RESET_ALL}
  import os
  os.environ['PORTAL_USERNAME'] = 'your_username'
  os.environ['PORTAL_PASSWORD'] = 'your_password'
  
{Fore.YELLOW}安全提示:{Style.RESET_ALL}
  - 不要在公共场合或共享计算机上保存密码
  - 定期更换密码
  - 使用强密码（包含字母、数字和特殊字符）
""")

if __name__ == "__main__":
    import sys
    
    # 处理命令行参数
    force_full_update = False
    
    if len(sys.argv) > 1:
        # 清除凭据
        if sys.argv[1] == '--clear':
            ConfigManager.clear_credentials()
            sys.exit(0)
        # 全量更新
        elif sys.argv[1] in ['--force-full-update', '-ffu']:
            force_full_update = True
            ColorLogger.info(f"{Fore.YELLOW}强制完整更新模式已启用{Style.RESET_ALL}")
        # 帮助信息
        elif sys.argv[1] in ['--help', '-h']:
            show_help()
            sys.exit(0)
    
    ColorLogger.info("=" * 50)
    ColorLogger.info(f"{Fore.YELLOW}家课数据爬虫开始运行{Style.RESET_ALL}")
    ColorLogger.info("=" * 50)
    
    # 记录运行时间
    start_time = datetime.now()
    homework_data = main(force_full_update=force_full_update)
    end_time = datetime.now()
    
    ColorLogger.info("=" * 50)
    if homework_data:
        ColorLogger.success(f"爬虫运行完成！共处理 {Fore.WHITE}{len(homework_data)}{Style.RESET_ALL} 条家课记录")
    else:
        ColorLogger.warning("爬虫运行完成，但没有获取到任何家课记录")
    
    duration = end_time - start_time
    ColorLogger.info(f"运行时间: {Fore.WHITE}{duration}{Style.RESET_ALL}")
    ColorLogger.info("=" * 50)
