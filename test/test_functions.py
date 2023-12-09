# Import selenium functionalities
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

# Initialize selenium webdriver based on your browser
def initWebDriver(browser):
    # Create driver options on your browser
    if (browser == 'chrome'):
        options = webdriver.ChromeOptions()
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        #options.add_argument('--headless')
        options.set_capability("browserVersion", "117")
        options.add_argument('--log-level=3')
        driver = webdriver.Chrome(options=options)
    elif (browser == 'firefox'):
        options = webdriver.FirefoxOptions()
        options.log.level = 'error'
        options.add_argument('--headless')
        driver = webdriver.Firefox(options=options)
    elif (browser == 'edge'):
        options = webdriver.EdgeOptions()
        options.add_argument('--headless')
        options.set_capability("browserVersion", "117")
        driver = webdriver.Edge(options=options)
    elif (browser == 'safari'):
        options = webdriver.SafariOptions()
        options.add_argument('--background')
        driver = webdriver.Safari(options=options)
    else:
        raise ValueError(f"Unsupported browser - {browser}")

    return driver

# Wait for element with class 'App' to become present
def waitForElementByXPath(driver, xpath):
    try:
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, xpath)))
    except Exception as e:
        print(f"Failed to wait for element: {e}")
        driver.quit()