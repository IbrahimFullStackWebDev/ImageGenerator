const themeToggle = document.querySelector(".theme-toggle");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallary = document.querySelector(".gallary-grid");
const API_KEY = "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";
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An nunderwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
];

const applySavedTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  const isDarkTheme =
    savedTheme === "dark" || (!savedTheme && systemPrefersDark);

  document.body.classList.toggle("dark-theme", isDarkTheme);

  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};

const getImageDimenssions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaledFactor = baseSize / Math.sqrt(width * height);

  let calculatedWidth = Math.round(width * scaledFactor);
  let calculatedHeight = Math.round(height * scaledFactor);

  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

  return { width: calculatedWidth, height: calculatedHeight };
};

const updateImageCard = (imageIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imageIndex}`);
  if (!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}" alt="" class="img-result" />
              <div class="img-overlay">
                <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                  <i class="fa-solid fa-download"></i>
                </a>
              </div> `;
};

const generateImages = async (
  selectedMode,
  imageCount,
  aspectRatio,
  promptText
) => {
  const MODE_URL = `https://api-inference.huggingface.co/models/${selectedMode}`;

  const { width, height } = getImageDimenssions(aspectRatio);

  generateBtn.setAttribute("disabled", "true");
  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(MODE_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width: 512, height: 512 },

          options: { wait_for_model: true, use_cache: false },
        }),
      });
      if (!response.ok) throw new Error((await response.json())?.error);
      const result = await response.blob();
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent =
        "Generating Failed! Check cosole for more details.";
    }
  });
  await Promise.allSettled(imagePromises);
  generateBtn.removeAttributeAttribute("disabled");
};

const creatImageCards = (selectedMode, imageCount, aspectRatio, promptText) => {
  gridGallary.innerHTML = "";
  for (let index = 0; index < imageCount; index++) {
    gridGallary.innerHTML += `
<div class="img-card loading" id="img-card-${index}" style="aspect-ratio:${aspectRatio}">
  <div class="status-container">
    <div class="spinner"></div>
    <div class="fa-solid fa-triangle-exclamation"></div>
    <p class="status-text">Generating...</p>
  </div>
</div>`;
  }

  generateImages(selectedMode, imageCount, aspectRatio, promptText);
};

const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectedMode = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();
  creatImageCards(selectedMode, imageCount, aspectRatio, promptText);
};
promptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});

promptForm.addEventListener("submit", handleFormSubmit);

themeToggle.addEventListener("click", toggleTheme);

applySavedTheme();
