import requests
from bs4 import BeautifulSoup
import pandas as pd
import os
import re
import time
import json
import getpass
from datetime import datetime, timedelta
from colorama import init, Fore, Style

# 初始化colorama
init(autoreset=True)

class ColorLogger:
    """彩色日志输出类"""
    
    @staticmethod
    def info(message):
        print(f"{Fore.CYAN}[INFO]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def success(message):
        print(f"{Fore.GREEN}[SUCCESS]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def warning(message):
        print(f"{Fore.YELLOW}[WARNING]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def error(message):
        print(f"{Fore.RED}[ERROR]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def debug(message):
        print(f"{Fore.BLUE}[DEBUG]{Style.RESET_ALL} {message}")
    
    @staticmethod
    def progress(message, current, total):
        percent = (current / total) * 100
        print(f"{Fore.MAGENTA}[PROGRESS]{Style.RESET_ALL} {message} ({current}/{total} {percent:.1f}%)")

class ConfigManager:
    """配置管理器"""
    
    CONFIG_FILE = "portal_config.json"
    
    @classmethod
    def load_config(cls):
        """加载配置文件"""
        if os.path.exists(cls.CONFIG_FILE):
            try:
                with open(cls.CONFIG_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                ColorLogger.warning(f"配置文件损坏: {e}")
        return {}
    
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
        """获取登录凭据"""
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
        password = getpass.getpass(f"{Fore.CYAN}密码: {Style.RESET_ALL}").strip()
        
        if not username or not password:
            ColorLogger.error("用户名和密码不能为空")
            return None, None
        
        # 询问是否保存
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
    session = requests.Session()
    
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://portal.frcss.edu.hk',
        'Referer': 'https://portal.frcss.edu.hk/user.php',
        'Connection': 'keep-alive'
    })
    
    try:
        ColorLogger.info("正在获取登录页面...")
        response = session.get(login_url)
        
        login_data = {
            'uname': username,
            'pass': password,
            'op': 'login',
            'xoops_redirect': '',
            'from': 'profile'
        }
        
        ColorLogger.info(f"使用账号: {Fore.WHITE}{username}{Style.RESET_ALL} 登录...")
        ColorLogger.info("正在提交登录表单...")
        
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
        
        if '登入' in response_text and '帳號' in response_text:
            ColorLogger.error("登录失败：用户名或密码错误")
            return None
        else:
            ColorLogger.success("登录成功！")
            
            test_url = "https://portal.frcss.edu.hk/modules/clsrm/?md=hw"
            test_response = session.get(test_url)
            if test_response.status_code == 200:
                ColorLogger.success("成功访问家课页面，登录状态确认")
            else:
                ColorLogger.warning(f"访问家课页面失败，状态码: {test_response.status_code}")
            
            return session
            
    except Exception as e:
        ColorLogger.error(f"登录过程中出错: {e}")
        return None

def clean_subject_name(subject_text):
    """清理科目名称"""
    pattern = r'(.+?) -- ([A-Z]+)'
    match = re.match(pattern, subject_text)
    
    if match:
        chinese_name = match.group(1).strip()
        english_code = match.group(2).strip()
        
        if len(english_code) % 2 == 0:
            half_length = len(english_code) // 2
            if english_code[:half_length] == english_code[half_length:]:
                english_code = english_code[:half_length]
        
        return f"{chinese_name} -- {english_code}"
    return subject_text

def get_homework_by_date(session, date_str):
    """获取指定日期的家课数据"""
    ajax_url = "https://portal.frcss.edu.hk/modules/clsrm/clsrm_hw_oper.php"
    
    data = {
        'oper': 'hw_tbl',
        'slt_term': '1',
        'slt_subj': '',
        'slt_date': date_str,
        'slt_tide': 'create'
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://portal.frcss.edu.hk/modules/clsrm/?md=hw',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://portal.frcss.edu.hk'
    }
    
    try:
        ColorLogger.info(f"正在获取 {Fore.WHITE}{date_str}{Style.RESET_ALL} 的家课数据...")
        response = session.post(ajax_url, data=data, headers=headers)
        
        if response.status_code != 200:
            ColorLogger.error(f"请求失败，状态码: {response.status_code}")
            return None
            
        try:
            result = response.json()
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
    """解析家课表HTML内容"""
    if not html_content:
        return []
        
    soup = BeautifulSoup(html_content, 'html.parser')
    homework_data = []
    homework_table = soup.find('table', {'id': 'hw_table'})
    
    if homework_table:
        rows = homework_table.find_all('tr')[1:]
        for row in rows:
            cells = row.find_all('td')
            if len(cells) >= 7:
                homework_data.append({
                    'id': cells[0].get_text(strip=True),
                    'issue_date': cells[1].get_text(strip=True),
                    'due_date': cells[2].get_text(strip=True),
                    'class_group': cells[3].get_text(strip=True),
                    'subject': clean_subject_name(cells[4].get_text(strip=True)),
                    'homework_name': cells[5].get_text(strip=True),
                    'remarks': cells[6].get_text(strip=True),
                })
        ColorLogger.success(f"解析到 {Fore.WHITE}{len(homework_data)}{Style.RESET_ALL} 条家课记录")
    else:
        ColorLogger.warning("未找到家课表格")
    
    return homework_data

def get_date_range():
    """获取从9月1日到今天的日期范围"""
    current_year = datetime.now().year
    start_date = datetime(current_year, 9, 1)
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
    
    with open('homework_data.json', 'w', encoding='utf-8') as f:
        json.dump(homework_data, f, ensure_ascii=False, indent=2)
    
    df = pd.DataFrame(homework_data)
    if 'due_date' in df.columns:
        df['due_date'] = pd.to_datetime(df['due_date'], errors='coerce')
        df = df.sort_values('due_date')
    df.to_excel('homework_data.xlsx', index=False, engine='openpyxl')
    
    ColorLogger.success(f"数据已保存: {Fore.WHITE}{len(homework_data)}{Style.RESET_ALL} 条记录")

def main():
    """主函数"""
    # 获取凭据
    username, password = ConfigManager.get_credentials()
    
    if not username or not password:
        ColorLogger.error("无法获取登录凭据，程序退出")
        return []
    
    session = login_to_portal(username, password)
    if not session:
        ColorLogger.error("登录失败，无法继续获取数据")
        return []
    
    if os.path.exists('homework_data.json'):
        ColorLogger.info("检测到已存在数据，更新今天的数据...")
        try:
            with open('homework_data.json', 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            existing_ids = {item['id'] for item in existing_data if 'id' in item}
        except Exception as e:
            ColorLogger.error(f"读取现有数据失败: {e}")
            existing_data = []
            existing_ids = set()
        
        today = datetime.now().strftime('%Y-%m-%d')
        homework_html = get_homework_by_date(session, today)
        new_homework = parse_homework_data(homework_html) if homework_html else []
        
        new_count = 0
        for item in new_homework:
            if item['id'] not in existing_ids:
                existing_data.append(item)
                new_count += 1
        
        homework_data = existing_data
        ColorLogger.success(f"新增 {Fore.WHITE}{new_count}{Style.RESET_ALL} 条记录")
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
            
            time.sleep(1)
    
    if homework_data:
        save_data(homework_data)
    else:
        ColorLogger.warning("没有获取到家课数据")
    
    return homework_data

def show_help():
    """显示帮助信息"""
    print(f"""
{Fore.YELLOW}家课数据爬虫使用说明{Style.RESET_ALL}

{Fore.CYAN}使用方法:{Style.RESET_ALL}
  python homework_crawler.py          # 正常运行爬虫
  python homework_crawler.py --clear  # 清除保存的凭据
  python homework_crawler.py --help   # 显示此帮助信息

{Fore.CYAN}凭据获取优先级:{Style.RESET_ALL}
  1. 环境变量 (PORTAL_USERNAME, PORTAL_PASSWORD)
  2. 本地配置文件 (portal_config.json)
  3. 用户交互输入

{Fore.CYAN}环境变量设置示例:{Style.RESET_ALL}
  export PORTAL_USERNAME="your_username"
  export PORTAL_PASSWORD="your_password"
""")

if __name__ == "__main__":
    import sys
    
    # 处理命令行参数
    if len(sys.argv) > 1:
        if sys.argv[1] == '--clear':
            ConfigManager.clear_credentials()
            sys.exit(0)
        elif sys.argv[1] in ['--help', '-h']:
            show_help()
            sys.exit(0)
    
    ColorLogger.info("=" * 50)
    ColorLogger.info(f"{Fore.YELLOW}家课数据爬虫开始运行{Style.RESET_ALL}")
    ColorLogger.info("=" * 50)
    
    start_time = datetime.now()
    homework_data = main()
    end_time = datetime.now()
    
    ColorLogger.info("=" * 50)
    if homework_data:
        ColorLogger.success(f"爬虫运行完成！共处理 {Fore.WHITE}{len(homework_data)}{Style.RESET_ALL} 条家课记录")
    else:
        ColorLogger.warning("爬虫运行完成，但没有获取到任何家课记录")
    
    duration = end_time - start_time
    ColorLogger.info(f"运行时间: {Fore.WHITE}{duration}{Style.RESET_ALL}")
    ColorLogger.info("=" * 50)