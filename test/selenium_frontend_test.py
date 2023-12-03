from selenium import webdriver
from selenium.webdriver.common.by import By
from test_functions import *

# Initialize Selenium WebDriver
options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-logging'])
options.add_argument("--headless")
driver = webdriver.Chrome(options=options)

# Open React application
driver.get("http://localhost:3000")

# Test Case 1: Check if the app title is correct
# Wait for element with class 'App' to become present
#waitForElementByClass(driver, "App")

# Find element with class 'App'
app_text = findElementText(driver, "App", "React Selenium Example")

# Check if title is correct
print("")
if (app_text == "React Selenium Example"):
    print(f"Test Case 1 Passed - Title is '{app_text}'")
else:
    print("Test Case 1 Failed - Incorrect Title")


# Test Case 2: Input two numbers, add them, and check the result
# Locate both inputs and submit button
num1_input = driver.find_element(By.XPATH, "//label[text()='Number 1:']/input")
num2_input = driver.find_element(By.XPATH, "//label[text()='Number 2:']/input")
add_button = driver.find_element(By.XPATH, "//button[text()='Add Numbers']")

# Send keys and submit
num1_input.send_keys("10")
num2_input.send_keys("5")
add_button.click()

# Check if result is correct
result_sum = driver.find_element(By.XPATH, "//div[contains(text(), 'Sum:')]").text
if ("15" in result_sum):
    print(f"Test Case 2 Passed - {result_sum}")
else:
    print("Test Case 2 Failed - result != 15")


# Test Case 3: Check if the result is updated after changing the numbers
# Clear inputs and send new keys
num1_input.clear()
num1_input.send_keys("20")
num2_input.clear()
num2_input.send_keys("7")

# Submit
add_button.click()

# Check if result is correct
result_sum = driver.find_element(By.XPATH, "//div[contains(text(), 'Sum:')]").text
if ("27" in result_sum):
    print(f"Test Case 3 Passed - {result_sum}")
else:
    print(f"Test Case 3 Failed - {result_sum}")


# Wait for user input before closing the browser
input("\nPress Enter to close browser")

# Close the browser
driver.close()