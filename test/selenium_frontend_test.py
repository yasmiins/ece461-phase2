# Import testing functions
from test_functions import *

# Initialize Selenium WebDriver
driver = initWebDriver('chrome')

# Open React application
driver.get("http://localhost:3000")

'''     Test 1: Search Tab     '''
try:
    # Test 1.1: Find search tab button and click it
    searchTabXPath = "//*[@id='root']/div/div[1]/button[2]"
    searchTab = driver.find_element(By.XPATH, searchTabXPath)
    searchTab.click()

    headerXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    headerInfo = driver.find_element(By.XPATH, headerXPath).text
    if (headerInfo != 'Search'):
        raise ValueError(f"'{headerInfo}' != 'Search'")

    # Test 1.2: Using the search query
    searchQueryXPath = "//*[@id='root']/div/div[2]/div[1]/div/form/input"
    searchQuery = driver.find_element(By.XPATH, searchQueryXPath)
    searchQuery.send_keys("Package")

    # Test 1.3: Click the "Use Regex Search" button
    regBtnXPath = "//*[@id='root']/div/div[2]/div[1]/div/div/label/input"
    regexButton = driver.find_element(By.XPATH, regBtnXPath)
    regexButton.click()
except ValueError as vErr:
    print(f"Test 1 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 1 Failed - Error: {e}")
else:
    print("Test 1 Passed")


'''     Test 2: Directory Tab     '''
try:
    # Test 2.1: Find directory tab button and click it
    directoryTabXPath = "//*[@id='root']/div/div[1]/button[3]"
    directoryTab = driver.find_element(By.XPATH, directoryTabXPath)
    directoryTab.click()

    directoryHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    directoryHeader = driver.find_element(By.XPATH, directoryHeaderXPath).text
    if (directoryHeader != 'Directory'):
        raise ValueError(f"'{directoryHeader}' != 'Directory'")
except ValueError as vErr:
    print(f"Test 2 Failed - Value Error: {vErr}")
else:
    print("Test 2 Passed")


'''     Test 3: Upload Tab     '''
try:
    # Test 3.1: Find upload tab button and click it
    uploadTabXPath = "//*[@id='root']/div/div[1]/button[4]"
    uploadTab = driver.find_element(By.XPATH, uploadTabXPath)
    uploadTab.click()

    uploadHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    uploadHeader = driver.find_element(By.XPATH, uploadHeaderXPath).text
    if (uploadHeader != 'Upload'):
        raise ValueError(f"'{uploadHeader}' != 'Upload'")
    
    # Test 3.2: Enter text into the 3 text fields
    uploadTextIDXPath = "//*[@id='root']/div/div[2]/div[1]/div/div[1]/input"
    uploadTextID = driver.find_element(By.XPATH, uploadTextIDXPath)
    uploadTextID.send_keys("n")
    uploadTextNameXPath = "//*[@id='root']/div/div[2]/div[1]/div/div[2]/input"
    uploadTextName = driver.find_element(By.XPATH, uploadTextNameXPath)
    uploadTextName.send_keys("p")
    uploadTextVersionXPath = "//*[@id='root']/div/div[2]/div[1]/div/div[3]/input"
    uploadTextVersion = driver.find_element(By.XPATH, uploadTextVersionXPath)
    uploadTextVersion.send_keys("m")

except ValueError as vErr:
    print(f"Test 3 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 3 Failed - Error: {e}")
else:
    print("Test 3 Passed")


'''     Test 4: Help Tab     '''
try:
    # Test 4.1: Find help tab button and click it
    helpTabXPath = "//*[@id='root']/div/div[1]/button[5]"
    helpTab = driver.find_element(By.XPATH, helpTabXPath)
    ''' Figure this error out '''
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, helpTabXPath)))
    helpTab.click()

    helpHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    helpHeader = driver.find_element(By.XPATH, helpHeaderXPath).text
    if (helpHeader != 'Help'):
        raise ValueError(f"'{helpHeader}' != 'Help'")

except ValueError as vErr:
    print(f"Test 4 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 4 Failed - Error: {e}")
else:
    print("Test 4 Passed")


'''     Test 5: Home Tab     '''
try:
    # Test 5.1: Find home tab button and click it
    homeTabXPath = "//*[@id='root']/div/div[1]/button[1]"
    homeTab = driver.find_element(By.XPATH, homeTabXPath)
    homeTab.click()

    homeHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    homeHeader = driver.find_element(By.XPATH, homeHeaderXPath).text
    if (homeHeader != 'Home Page'):
        raise ValueError(f"'{homeHeader}' != 'Home Page'")
except ValueError as vErr:
    print(f"Test 5 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 5 Failed - Error: {e}")
else:
    print("Test 5 Passed")


# Wait for user input before closing the browser
input("Press Enter to close browser")

# Close the browser
driver.close()