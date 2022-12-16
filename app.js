//Global selections and varibales
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const slidersBtns = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const currentHexes = document.querySelectorAll(".color h2");
const refreshBtn = document.querySelector("button[class='generate']");
const popup = document.querySelector(".copy-container");
let initialColors;
let randomColor;
//This is for local storage
let savedPalettes = [];

//Add Event Listeners
refreshBtn.addEventListener('click', randomColors);
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach(hex =>{
    hex.addEventListener('click', ()=>{
        copyToClipboard(hex);
    });
});

slidersBtns.forEach((slidersBtn, index) => {
  slidersBtn.addEventListener("click", (e) => {
    activateSlider(index);
  });
});

popup.addEventListener("transitionend", ()=>{
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});
lockBtn.forEach((btn, index) => {
    btn.addEventListener("click", e => {
      lockLayer(e, index);
    });
  });

//Functions
//Colour Generator Function
function generateHex() {
  // //How to generate random colours using vanilla JS
  // const letters = "0123456789ABCDEF";
  // let hash = "#";
  // for (let i=0; i <6; i++){
  //     hash += letters[Math.floor(Math.random()*16)];
  // }
  // return hash;

  // How to generate random colors using chroma.js
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    randomColor = generateHex();
    //push the random colors generated to the the empty array.
    if (div.classList.contains('locked')) {
        initialColors.push(hexText.innerText);
        return;
    }else {
        initialColors.push(chroma(randomColor).hex());
    }
    //add colors to the background
    div.style.backgroundColor = randomColor;
    hexText.innerHTML = randomColor;
    //check for contrast
    checkTextContrast(randomColor, hexText);
    //initial Colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //Reset Input
  resetInputs();
//   //Check For Button Contrast if the backgound is neutral
  slidersBtns.forEach((btn, index) => {
    checkTextContrast(initialColors[index], btn);
    checkTextContrast(initialColors[index], lockBtn[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  //scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75),rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}
function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  colorizeSliders(color, hue, brightness, saturation);
}
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerHTML = color.hex();
  //check contrast
  checkTextContrast(color, textHex);

  // check contrast for icons if icon backgound is neutral
  for(icon of icons) {
      checkTextContrast(color, icon);
  }
}
//
function activateSlider(index) {
  const slidersDivs = document.querySelectorAll(".sliders");
  const activeDiv = slidersDivs[index];
  const btn = activeDiv.querySelector("button");
  activeDiv.classList.add("active");
  btn.onclick = () => {
    activeDiv.classList.remove("active");
  };
}
// refreshBtn.onclick = () => {
//   randomColors();
// };
// //Another to write event listener
// refreshBtn.addEventListener('click', randomColors);
// Another way
// refreshBtn.addEventListener("click", ()=>{
//         randomColors();
// });

//updating the sliders
function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input");
    sliders.forEach(slider =>{
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }; if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = (Math.floor(brightValue*100)/100);
        }; if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = (Math.floor(satValue*100)/100);
        }
    });
}
// Copy colour to clipborad
function copyToClipboard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    //pop up animation
    const popupBox = popup.children[0];
    popup.classList.add('active');
    popupBox.classList.add('active');
}

function lockLayer(e, index) {
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");
  
    if (lockSVG.classList.contains("fa-lock-open")) {
      e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
  }

//Implement Save to palette and LOCAL STORAGE STUFF
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

//Event Listeners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.add("remove");
}
function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach(hex => {
    colors.push(hex.innerText);
  });
  //Generate Object
  //*1
  // const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  // let paletteNr;
  // if (paletteObjects) {
  //   paletteNr = paletteObjects.length;
  // } else {
  //   paletteNr = savedPalettes.length;
  // }

  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  //Save to localStorage
  savetoLocal(paletteObj);
  saveInput.value = "";
  //Generate the palette for Library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach(smallColor => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  //Attach event to the btn
  paletteBtn.addEventListener("click", e => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  //Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    //Local Palettes
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    // *2

    savedPalettes = [...paletteObjects];
    paletteObjects.forEach(paletteObj => {
      //Generate the palette for Library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      //Attach event to the btn
      paletteBtn.addEventListener("click", e => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      //Append to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

// localStorage.clear();

getLocal();

randomColors();
