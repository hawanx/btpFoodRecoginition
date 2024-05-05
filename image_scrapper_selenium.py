import math
import time
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import urllib

start_time = time.time()

images_to_be_fetched = 100

options = Options()
options.add_experimental_option("detach", True)
wd = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


def download_images(query: str, sleep_between_interactions: int = 2):
    def scroll_to_end():
        wd.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(sleep_between_interactions)

    search_url = "https://www.google.com/search?safe=off&site=&tbm=isch&source=hp&q={q}&oq={q}&gs_l=img"

    if query[:3] == "Raw":
        wd.get(search_url.format(q="unripe " + query.split(" ")[1] + " fruit"))
    else:
        wd.get(search_url.format(q=query + " fruit"))

    scroll_to_end()

    thumbnail_results = wd.find_elements(By.XPATH, "//img[@class='YQ4gaf']")
    if len(thumbnail_results) == 0:
        thumbnail_results = wd.find_elements(By.XPATH, "//img[@class='rg_i Q4LuWd']")

    download_images = 0

    for img in thumbnail_results:
        try:
            img.click()
            time.sleep(sleep_between_interactions)
            image = wd.find_element(By.XPATH, "//img[contains(@class,'iPVvYb')]")
            urllib.request.urlretrieve(image.get_attribute('src'), f"{query}/image_{download_images + 1}.jpg")
            download_images += 1
            print(
                f"{image.get_attribute('src')} {len(thumbnail_results) - download_images} {images_to_be_fetched - download_images} ")
        except Exception as e:
            print(e)
            continue
        if download_images >= images_to_be_fetched:
            return images_to_be_fetched
    return download_images


queries = ["Raw Apple", "Raw Banana", "Raw Orange", "Raw Pomegranate", "Raw Mango", "Raw Papaya",
           "Ripe Apple", "Ripe Banana", "Ripe Orange", "Ripe Pomegranate", "Ripe Mango", "Ripe Papaya",
           "Rotten Apple", "Rotten Banana", "Rotten Orange", "Rotten Pomegranate", "Rotten Mango", "Rotten Papaya"
           ]

logs = []
for query in queries:
    os.makedirs(query, exist_ok=True)
    total_images_downloaded = download_images(query)
    logs.append(f"{total_images_downloaded} images of {query} downloaded in {math.ceil(time.time() - start_time)} "
                f"seconds")
for x in logs:
    print(x)
wd.quit()

