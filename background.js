console.log("Background script loaded."); // - this will not show in the normal console in chrome extension details Inspect views -> click service worker it displays here
// chrome.action.setPopup({ popup: "" }); - onclicking the Extension nothing will display 

//Only display on Maang.in website
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("maang.in")) {
      chrome.action.setPopup({ tabId, popup: "index.html" });
    } else {
      chrome.action.setPopup({ tabId, popup: "" }); 
    }
  });
  
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && tab.url.includes("maang.in")) {
      chrome.action.setPopup({ tabId: activeInfo.tabId, popup: "index.html" });
    } else {
      chrome.action.setPopup({ tabId: activeInfo.tabId, popup: "" });
    }
  });



  
  