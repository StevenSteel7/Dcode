
var screenshotImage = ""
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.type == "screenshot") {
        var url = chrome.runtime.getURL("index.html");
        screenshotImage = await chrome.tabs.captureVisibleTab();
        var tab = chrome.tabs.create({ url: url });
        sendResponse({ success: true });
    }
    if (request.type == "requestScreenshot") {
        sendResponse({ screenshotImage: screenshotImage });
    }
});


/* Purpose:
Its always running...

Capturing Screenshots: When the message type is "screenshot", the extension captures a screenshot of the currently visible browser tab.
Returning the Screenshot: When the message type is "requestScreenshot", the extension responds with the captured screenshot. */

/* Workflow:
Another part of the extension (e.g., a popup or content script) sends a message to capture the visible tab (type "screenshot").
The screenshot is taken, stored in screenshotImage, and a new tab opens with the extension's UI.
When the extension (e.g., the UI or popup) needs the screenshot, it sends another message (type "requestScreenshot"), and the screenshot is returned.
This is useful when you want to capture a screenshot, store it temporarily, and use it in other parts of the extension (such as displaying or processing it). */