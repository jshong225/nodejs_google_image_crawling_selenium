const chrome = require("selenium-webdriver/chrome");
const fs = require("fs");
const https = require("https");
const { Builder, By, Key, until } = require("selenium-webdriver");

const run = async (searchWord, scroll) => {
  const service = new chrome.ServiceBuilder("./chromedriver.exe").build();
  chrome.setDefaultService(service);
  const driver = await new Builder().forBrowser("chrome").build();

  // Direct move to image search page (save google main page to input search time)
  const url = "https://www.google.com/search?q=";
  const keyword = searchWord;
  const imageTab = "&source=lnms&tbm=isch";
  await driver.get(url + keyword + imageTab);

  // Scroll page
  const elem = driver.findElement(By.tagName("body"));
  for (let i = scroll; i > 0; i--) {
    await elem.sendKeys(Key.PAGE_DOWN);
    try {
      await driver.findElement(By.className("mye4qd")).click();
    } catch (err) {}
    console.log(`Scrolling...${i}`);
  }

  // Get image url and download
  const imgs = await driver.findElements(By.className("rg_i Q4LuWd"));
  console.log("total image : " + imgs.length);
  const links = [];
  let pos = 1;
  // Create folder
  !fs.existsSync(keyword) && fs.mkdirSync(keyword);
  for (let img of imgs) {
    let imgurl = await img.getAttribute("src");
    if (imgurl != null) {
      links.push(imgurl);
      // Folder Path
      let dir = `./${keyword}/${pos}.png`;
      // Image Download
      if (imgurl != null && imgurl.includes("data:image", 0)) {
        // Base64 image
        let base64 = imgurl.split(",");
        let decode = Buffer.from(base64[1], "base64");
        fs.writeFileSync(dir, decode);
        console.log(`${pos} Download Completed`);
      } else if (imgurl != null) {
        // Https URL image
        https.get(imgurl, (res) => {
          const filePath = fs.createWriteStream(dir);
          res.pipe(filePath);
          filePath.on("finish", () => {
            filePath.close();
            console.log(`${pos} Download Completed`);
          });
        });
      } else {
        console.log(`Can't find url`);
      }
      pos++;
    }
  }
  driver.quit();
};

// First variable : search word
// Second variable : num of scroll (I think 250 is enough.)
run("dog", 250);
