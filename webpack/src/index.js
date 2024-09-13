const { createWorker } = require('tesseract.js');

window.addEventListener("message", async (event) => {
  
  if (event.data.type == "imageProcessing" || event.data.type == "cancel") {
    const worker = createWorker(event.data.lang);
    if (event.data.type == "imageProcessing") {
      const url = event.data.image;
      worker.then((worker) => {
        worker.recognize(event.data.image).then(({ data: { text } }) => {
          console.log(text);
          window.parent.postMessage({ type: "processedText", text: text }, "*");
        });
      })

    }
    else {
      await worker.then((worker) => {
        worker.terminate();
      })
    }

  }
});




/* const { createWorker } = require('tesseract.js');
This imports the createWorker function from the Tesseract.js library, which is used to create a worker for running the OCR process.
 */


/* Summary:
The code listens for messages.
When a message with the type "imageProcessing" is received, it processes the image using Tesseract.js to extract text.
The extracted text is sent back to the parent window.
If the message type is "cancel", the OCR worker is terminated.
 */