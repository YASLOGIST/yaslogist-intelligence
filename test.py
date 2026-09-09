from selenium import webdriver
from selenium.webdriver.chrome.options import Options
options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
try:
    driver = webdriver.Chrome(options=options)
    driver.get(f"file:///Users/ah/YASLOGISTMilitary intelligence/index.html")
    print("Page title:", driver.title)
    
    # Print the visible elements
    panels = driver.find_elements(by="css selector", value=".tab-panel")
    for p in panels:
        print(f"Panel {p.get_attribute('id')}: display = {p.value_of_css_property('display')}")
        
    driver.quit()
except Exception as e:
    print("Selenium error:", e)
