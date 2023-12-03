from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

# Wait for element with class 'App' to become present
def waitForElementByClass(driver, className):
    try:
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CLASS_NAME, className)))

    except Exception as e:
        print(f"Failed to wait for element with class '{className}': {e}")
        driver.quit()

# Find an element and return it's text
def findElementText(driver, className, specificText=None):
    try:
        # Obtain a class's text
        element_class = driver.find_element(By.CLASS_NAME, className)
        class_text = element_class.get_attribute("innerText")
        
        if (specificText != ""):
            # Separate text by "\n" and search for specified text
            class_text = class_text.split("\n")
            if (specificText in class_text):
                index = class_text.index(specificText)
                class_text = class_text[index]

        return class_text
    
    except Exception as e:
        print(f"Failed to find class {className} or obtain it's text: {e}")
        driver.quit()