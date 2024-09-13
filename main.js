/* 
Json stringify --> array to json
Json.parse --> json to array  */



function createImgNode(src) {
  var imageNode = document.createElement("img");
  imageNode.id = "image";
  imageNode.src = src;
  var textArea = document.getElementById("convertText");
  document.body.insertBefore(imageNode, textArea);
}
/* This is used to display the screenshot or image that will be cropped. */



window.addEventListener('DOMContentLoaded', function () {
  chrome.runtime.sendMessage({ type: "requestScreenshot" }, function (response) {  // sends request for background to take screenshot
    createImgNode(response.screenshotImage);       // createImgNode function used to create an image node..
    var image = document.querySelector('#image');


    var cropper = new Cropper(image, {
      autoCrop: false,
      toggleDragModeOnDblclick: false,
      moveable: false,
      viewMode: 3,                                    // no zooming and other movement
      cropstart: function (e) {
        console.log("START", e)
      },
      cropmove: function (e) {
        document.getElementById("overlay").setAttribute("hidden", "");
        cropBox = document.getElementsByClassName("cropper-crop-box")[0];
        cropBoxDim = cropBox.getBoundingClientRect();
        button = document.getElementById("convertText");
        button.removeAttribute("hidden")
        button.style = `top: ${cropBoxDim.top - button.clientHeight < 0 ? 0 : cropBoxDim.top - button.clientHeight}px;left:${cropBoxDim.left}px;`
      }
    });


    document.getElementById("close").onclick = () => {
      cropper.clear();
      document.getElementById("overlay").removeAttribute("hidden");
      document.getElementById("convertText").setAttribute("hidden", "")
    }
    window.onresize = function (event) {
      cropper.reset();
    };

    var button = document.querySelector("#getText");
    button.onclick = function () {
      var crop_image = cropper.getCroppedCanvas().toDataURL('image/jpeg');
      document.getElementById("loading").removeAttribute("hidden");
      document.getElementById("getText").setAttribute("hidden", "");
      // Send image to sandbox to process
      iframe.contentWindow.postMessage({ type: "imageProcessing", image: crop_image, lang: window.localStorage.getItem("lang") }, "*");
    };
    if (window.localStorage.getItem("lang") == null) {
      window.localStorage.setItem("lang", "eng");
    }
    var lang = document.getElementById("lang");
    lang.innerText = window.localStorage.getItem("lang").toUpperCase();
    lang.onclick = function () {
      if (lang.innerText == "ENG") {
        window.localStorage.setItem("lang", "jpn")
        lang.innerText = "JPN";
      } else {
        window.localStorage.setItem("lang", "eng")
        lang.innerText = "ENG";
      }
    }
  });
});


// for storing in the browser

window.addEventListener('message', function (event) {
  
  // Retrieve existing OCR_TEXT from local storage
  if (event.data.type == "processedText") {
    item = JSON.parse(localStorage.getItem("OCR_TEXT"));  //converts the stored JSON string back into a JavaScript array.
    if (item == null) {
      item = []
    }

    // Remove line breaks from the received text
    const withoutLineBreaks = event.data.text.replace(/[\r\n]/gm, '');
    if(!withoutLineBreaks){  // if its empty... leave it
      return;
    }

/* 
Purpose: Adds withoutLineBreaks to the beginning of the item array. and older text below
 */
    item.unshift(withoutLineBreaks);
   /*  all the image text is stored under the key OCRTEXT */
    localStorage.setItem("OCR_TEXT", JSON.stringify(item));
    document.getElementById("getText").removeAttribute("hidden");
    document.getElementById("loading").setAttribute("hidden", "");
    alert(event.data.text);
  }


//This type indicates that some processing OCR or image processing is finished.
  if (event.data.type == "stopped") {
    document.getElementById("getText").removeAttribute("hidden"); // Now the get text is made visible
    document.getElementById("loading").setAttribute("hidden", ""); // and loading is invisible
  }

});

/* The script integrates a cropping tool and OCR processing functionality within a Chrome extension's popup or content page.
It manages user interactions for cropping and processing images, 
handles language settings, and communicates with background scripts and iframes 
to perform OCR and update the UI accordingly. */