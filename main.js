// Initialize the screenshot and cropping functionality
const initializeScreenshotCropper = () => {
  chrome.runtime.sendMessage({ type: "requestScreenshot" }, (response) => {
    createImgNode(response.screenshotImage);
    initializeCropper();
    setupCloseAndResizeHandlers();
    setupOCRButton();
    initializeLanguageSettings();
  });
};

// Create an image node dynamically
const createImgNode = (src) => {
  const imageNode = document.createElement("img");
  imageNode.id = "image";
  imageNode.src = src;
  const textArea = document.getElementById("convertText");
  document.body.insertBefore(imageNode, textArea);
};

// Initialize the cropper functionality
const initializeCropper = () => {

/*   const image = document.querySelector('#image'); // will search for css and id too  */
const image = document.getElementById('image');


  window.cropper = new Cropper(image, {
    autoCrop: false,
    toggleDragModeOnDblclick: false,
    moveable: false,
    viewMode: 3,
    cropstart: handleCropStart,
    cropmove: handleCropMove,
  });
};

// Function to handle when cropping starts
const handleCropStart = (e) => {
  console.log("START", e);
};

// Function to handle crop movement
const handleCropMove = (e) => {
  document.getElementById("overlay").setAttribute("hidden", "");
  const cropBox = document.getElementsByClassName("cropper-crop-box")[0];
  const cropBoxDim = cropBox.getBoundingClientRect();
  const button = document.getElementById("convertText");
  button.removeAttribute("hidden");
  button.style = `top: ${cropBoxDim.top - button.clientHeight < 0 ? 0 : cropBoxDim.top - button.clientHeight}px; left: ${cropBoxDim.left}px;`;
};

// Set up close button and window resize handler
const setupCloseAndResizeHandlers = () => {
  document.getElementById("close").onclick = () => {
    window.cropper.clear();
    document.getElementById("overlay").removeAttribute("hidden");
    document.getElementById("convertText").setAttribute("hidden", "");
  };

  window.onresize = () => {
    window.cropper.reset();
  };
};

// Set up the OCR button that processes the cropped image
const setupOCRButton = () => {
  const button = document.querySelector("#getText");
  button.onclick = () => {
    const cropImage = window.cropper.getCroppedCanvas().toDataURL('image/jpeg');    //
    processCroppedImage(cropImage);
  };
};

// Process the cropped image and send it for OCR processing
const processCroppedImage = (cropImage) => {
  document.getElementById("loading").removeAttribute("hidden");
  document.getElementById("getText").setAttribute("hidden", "");
  iframe.contentWindow.postMessage({ type: "imageProcessing", image: cropImage, lang: getLanguageSetting() }, "*");
};

// Initialize the language settings (ENG/JPN)
const initializeLanguageSettings = () => {
  if (!window.localStorage.getItem("lang")) {
    window.localStorage.setItem("lang", "eng");
  }

  const lang = document.getElementById("lang");
  lang.innerText = window.localStorage.getItem("lang").toUpperCase();
  lang.onclick = toggleLanguage;
};

// Toggle language setting between English and Japanese
const toggleLanguage = () => {
  const lang = document.getElementById("lang");
  if (lang.innerText === "ENG") {
    window.localStorage.setItem("lang", "jpn");
    lang.innerText = "JPN";
  } else {
    window.localStorage.setItem("lang", "eng");
    lang.innerText = "ENG";
  }
};

// Get the current language setting from localStorage
const getLanguageSetting = () => window.localStorage.getItem("lang");

// Handle post messages, including processed OCR text
const handlePostMessage = (event) => {
  if (event.data.type === "processedText") {
    storeProcessedText(event.data.text);
  } else if (event.data.type === "stopped") {
    toggleLoadingAndGetTextButtons(false);
  }
};

// Store the processed text into localStorage and update the UI
const storeProcessedText = (text) => {
  let item = JSON.parse(localStorage.getItem("OCR_TEXT")) || [];
  const withoutLineBreaks = text.replace(/[\r\n]/gm, '');

  if (!withoutLineBreaks) return;

  item.unshift(withoutLineBreaks);
  localStorage.setItem("OCR_TEXT", JSON.stringify(item));
  toggleLoadingAndGetTextButtons(true);
  alert(text);
};

// Toggle visibility of the loading and get text buttons
const toggleLoadingAndGetTextButtons = (showGetText) => {
  document.getElementById("getText").removeAttribute(showGetText ? "hidden" : "hidden");
  document.getElementById("loading").setAttribute(showGetText ? "hidden" : "", "");
};

// Initialize and use all functions
window.addEventListener('DOMContentLoaded', initializeScreenshotCropper);
window.addEventListener('message', handlePostMessage);
