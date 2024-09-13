var screenshotImage = "";
let notes = JSON.parse(localStorage.getItem("OCR_TEXT")) || [];

// Function to remove a list item
function removeListItem(index) {
  notes.splice(index, 1);
  window.localStorage.setItem("OCR_TEXT", JSON.stringify(notes));
  renderList(notes);
}

// Function to create the HTML for a list item saved
function renderListItem(note, index) {
  let div = document.createElement("div");
  let a = document.createElement("a");
  let removeBtn = document.createElement("button");

  a.setAttribute("href", "#");
  a.setAttribute("class", "list-group-item list-group-item-action");
  a.setAttribute("data-bs-toggle", "tooltip");
  a.setAttribute("data-bs-placement", "bottom");
  a.setAttribute("title", "Click to copy");
  a.onclick = () => {
    navigator.clipboard.writeText(note);
  };
  a.innerText = note;

  removeBtn.setAttribute("class", "remove btn btn-danger btn-sm");
  removeBtn.setAttribute("index", index);
  removeBtn.innerText = "remove";
  removeBtn.onclick = () => removeListItem(index);

  div.appendChild(removeBtn);
  div.appendChild(a);
  return div;
}

// Function to render the list of notes
function renderList(notes) {
  let listGroup = document.querySelector("#list-group");
  listGroup.innerHTML = "";

  let header = document.createElement("a");
  let div = document.createElement("div");
  let removeBtn = document.createElement("button");

  header.setAttribute("href", "#");
  header.setAttribute("class", "list-group-item list-group-item-action active");
  header.setAttribute("aria-current", "true");
  header.innerText = "Text From OCR";

  removeBtn.setAttribute("style", "position: absolute; right: 22px; margin-top: 2px; z-index: 3;");
  removeBtn.setAttribute("class", "btn btn-danger");
  removeBtn.innerText = "Clear";
  removeBtn.onclick = () => {
    window.localStorage.removeItem("OCR_TEXT");
    notes = [];
    renderList(notes);
  };

  div.appendChild(removeBtn);
  div.appendChild(header);
  listGroup.appendChild(div);

  notes.forEach((note, index) => {
    listGroup.appendChild(renderListItem(note, index));
  });
}

// Function to filter notes based on search term
function search(searchTerm) {
  let filteredNotes = notes.filter(note => note.toLowerCase().includes(searchTerm.toLowerCase()));
  renderList(filteredNotes);
}

// Initialize event listeners after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchInput").addEventListener("input", (input) => {
    search(input.target.value);
  });

  document.getElementById("take_screenshot").onclick = async () => {   // when button with id of take screen shot is clicked .. screenshot is taken
    
    // Capture screenshot from active tab
    const screenshot = await chrome.tabs.captureVisibleTab();
    screenshotImage = screenshot;

    // Send the screenshot data to the background script
    chrome.runtime.sendMessage({ type: "screenshot", imageData: screenshot });

    // Assuming `iframe` exists somewhere, otherwise handle it accordingly
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage(screenshot, "*");
    }
  };

  // Initial render
  renderList(notes);
});
