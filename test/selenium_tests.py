# Import testing functions
from test_functions import *

# Initialize Selenium WebDriver
driver = initWebDriver('chrome')
#driver = initWebDriver('firefox')
#driver = initWebDriver('edge')
#driver = initWebDriver('safari')


# Open React application
driver.get("http://localhost:3000")


'''     Test 1: Upload Tab     '''
try:
    # Test 1.1: Find upload tab button and click it
    uploadTabXPath = "//*[@id='root']/div/div[1]/button[4]"
    uploadTab = driver.find_element(By.XPATH, uploadTabXPath)
    uploadTab.click()

    uploadHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    uploadHeader = driver.find_element(By.XPATH, uploadHeaderXPath).text
    if (uploadHeader != 'Upload'):
        raise ValueError(f"'{uploadHeader}' != 'Upload'")
    
    # Test 1.2: Click Content (Zip File) radio
    uploadContentXPath = "//*[@id='root']/div/div[2]/div[1]/div/div[1]/label[1]/input"
    uploadContent = driver.find_element(By.XPATH, uploadContentXPath)
    uploadContent.click()
    if (not(uploadContent.is_selected())):
        raise ValueError("Content radio supposed to be selected")
    uploadContent.click()

    errorMessageXPath = "//*[@id='root']/div/div[2]/div[1]/div/p"
    errorMessage = driver.find_element(By.XPATH, errorMessageXPath).text
    errorMessage.split(" ")
    if (errorMessage[0] != "Error"):
        raise ValueError("Error Message not being shown")

    # Test 1.3: Click URL radio and enter URL into text field
    uploadURLXPath = "//*[@id='root']/div/div[2]/div[1]/div/div[1]/label[2]/input"
    uploadURL = driver.find_element(By.XPATH, uploadURLXPath)
    uploadURL.click()
    if (not(uploadURL.is_selected())):
        raise ValueError("URL radio supposed to be selected")
    
    textGithubURLXPath = "//*[@id='root']/div/div[2]/div[1]/div/div[2]/input"
    textGithubURL = driver.find_element(By.XPATH, textGithubURLXPath)
    textGithubURL.send_keys("https://github.com/intel/hyperscan")

    # Test 1.4: Click upload package button
    uploadPackBtnXPath = "//*[@id='root']/div/div[2]/div[1]/div/button"
    uploadPackBtn = driver.find_element(By.XPATH, uploadPackBtnXPath)
    uploadPackBtn.click()

except ValueError as vErr:
    print(f"Test 1 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 1 Failed - Error: {e}")


'''     Test 2: Search Tab     '''
try:
    # Test 2.1: Find search tab button and click it
    searchTabXPath = "//*[@id='root']/div/div[1]/button[2]"
    searchTab = driver.find_element(By.XPATH, searchTabXPath)
    searchTab.click()

    headerXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    headerInfo = driver.find_element(By.XPATH, headerXPath).text
    if (headerInfo != 'Search'):
        raise ValueError(f"'{headerInfo}' != 'Search'")

    # Test 2.2: Using the search query
    searchQueryXPath = "//*[@id='root']/div/div[2]/div[1]/div/form/input"
    searchQuery = driver.find_element(By.XPATH, searchQueryXPath)
    searchQuery.send_keys("hyperscan")

    searchButtonXPath = "//*[@id='root']/div/div[2]/div[1]/div/form/button"
    searchButton = driver.find_element(By.XPATH, searchButtonXPath)
    searchButton.click()

    # Search query not working yet
    '''
    packNameXPath = "//*[@id='root']/div/div[2]/div[1]/div/div[2]/div/h1"
    packName = driver.find_element(By.XPATH, packNameXPath).text
    if (packName != 'Package Name: hyperscan'):
        raise ValueError(f"'{packName}' != 'Package Name: hyperscan")
    '''

    # Test 2.3: Click the "Use Regex Search" button
    regBtnXPath = "//*[@id='root']/div/div[2]/div[1]/div/div/label/input"
    regexButton = driver.find_element(By.XPATH, regBtnXPath)
    regexButton.click()

except ValueError as vErr:
    print(f"Test 2 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 2 Failed - Error: {e}")


'''     Test 3: Directory Tab     '''
try:
    # Test 3.1: Find directory tab button and click it
    directoryTabXPath = "//*[@id='root']/div/div[1]/button[3]"
    directoryTab = driver.find_element(By.XPATH, directoryTabXPath)
    directoryTab.click()

    directoryHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    directoryHeader = driver.find_element(By.XPATH, directoryHeaderXPath).text
    if (directoryHeader != 'Directory'):
        raise ValueError(f"'{directoryHeader}' != 'Directory'")
    
except ValueError as vErr:
    print(f"Test 3 Failed - Value Error: {vErr}")


'''     Test 4: Reset Tab     '''
try:
    # Test 4.1: Find reset tab button and click it
    resetTabXPath = "//*[@id='root']/div/div[1]/button[5]"
    resetTab = driver.find_element(By.XPATH, resetTabXPath)
    #WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, resetTabXPath)))
    resetTab.click()

    resetHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div/h1"
    resetHeader = driver.find_element(By.XPATH, resetHeaderXPath).text
    if (resetHeader != 'Reset'):
        raise ValueError(f"'{resetHeader}' != 'Reset'")

    # Test 4.2: Find Reset Registry button
    resetBtnXPath = "//*[@id='root']/div/div[2]/div[1]/div/button"
    resetBtn = driver.find_element(By.XPATH, resetBtnXPath)

except ValueError as vErr:
    print(f"Test 4 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 4 Failed - Error: {e}")


'''     Test 5: Info Tab     '''
try:
    # Test 5.1: Find info tab button and click it
    infoTabXPath = "//*[@id='root']/div/div[1]/button[1]"
    infoTab = driver.find_element(By.XPATH, infoTabXPath)
    infoTab.click()

    infoHeaderXPath = "//*[@id='root']/div/div[2]/div[1]/div[1]/h1"
    infoHeader = driver.find_element(By.XPATH, infoHeaderXPath).text
    if (infoHeader != 'Info Page'):
        raise ValueError(f"'{infoHeader}' != 'Info Page'")
    
except ValueError as vErr:
    print(f"Test 5 Failed - Value Error: {vErr}")
except Exception as e:
    print(f"Test 5 Failed - Error: {e}")


# Wait for user input before closing the browser
#input("Press Enter to close browser")

# Close the browser
driver.close()