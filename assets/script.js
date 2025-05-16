// Pricing details for each plan
const pricing = {
  basic: { base: 4.5, ram: 2 }, // 2GB RAM
  standard: { base: 9.0, ram: 4 }, // 4GB RAM
  premium: { base: 18.0, ram: 8 }, // 8GB RAM
  ultimate: { base: 25.0, ram: 16 }, // 16GB RAM
  enterprise: { base: 50.0, ram: 32 }, // 32GB RAM
};


// Function to initialize the application
function init() {
  displayStoredServers();
  setupLiveCostCalculation();
  setupPlayerPresetDropdown();
  setupRamPresetDropdown();
}

// Function to validate input values and update red text
function validateInputs(capacity, ram, capacityElement, ramElement) {
  let isValid = true;

  if (capacity > 1000) {
    capacityElement.nextElementSibling.style.display = "inline"; // Show red text
    isValid = false;
  } else {
    capacityElement.nextElementSibling.style.display = "none"; // Hide red text
  }

  if (ram > 64) {
    ramElement.nextElementSibling.style.display = "inline"; // Show red text
    isValid = false;
  } else {
    ramElement.nextElementSibling.style.display = "none"; // Hide red text
  }

  return isValid;
}

// Function to handle server creation
function createServer(event) {
  event.preventDefault(); // Prevent form submission

  // Get form values
  const serverName = document.getElementById("server-name").value;
  const serverType = document.getElementById("server-type").value;
  const serverRegion = document.getElementById("server-region").value;
  const serverPlan = document.getElementById("server-plan").value;

  // Determine the capacity based on the selected preset or custom input
  const playerPreset = document.getElementById("player-preset").value;
  const customCapacityInput = document.getElementById("custom-capacity");
  const serverCapacity =
    playerPreset === "custom"
      ? parseInt(customCapacityInput.value, 10)
      : parseInt(playerPreset, 10);

  // Determine the RAM based on the selected preset or custom input
  const ramPreset = document.getElementById("ram-preset").value;
  const customRamInput = document.getElementById("custom-ram");
  const serverRam =
    ramPreset === "custom"
      ? parseInt(customRamInput.value, 10)
      : parseInt(ramPreset, 10);

  // Validate inputs
  if (
    !validateInputs(
      serverCapacity,
      serverRam,
      customCapacityInput,
      customRamInput
    )
  ) {
    return;
  }

  // Calculate the monthly price based on the selected plan, capacity, and RAM
  const monthlyPrice = calculateCost(serverPlan, serverCapacity, serverRam);

  // Create a server object
  const server = {
    name: serverName,
    type: serverType,
    region: serverRegion,
    capacity: serverCapacity,
    ram: serverRam,
    plan: serverPlan,
    price: monthlyPrice.toFixed(2),
  };

  // Store the server in local storage
  let servers = JSON.parse(localStorage.getItem("servers")) || [];
  servers.push(server);
  localStorage.setItem("servers", JSON.stringify(servers));

  // Display the updated server list
  displayStoredServers();

  // Reset the form
  document.querySelector(".styled-form").reset();
  document.getElementById("calculated-cost").textContent = "0.00€"; // Reset live cost display
  document.getElementById("custom-capacity-container").style.display = "none"; // Hide custom input
  document.getElementById("custom-ram-container").style.display = "none"; // Hide custom RAM input
}

// Function to calculate the cost based on the plan, capacity, and RAM
function calculateCost(plan, capacity, ram) {
  const basePrice = pricing[plan].base;
  const ramCost = (ram - pricing[plan].ram) * 0.5; // 0.50€ per GB of additional RAM
  const capacityCost = capacity * 0.1; // 0.10€ per player
  return basePrice + Math.max(ramCost, 0) + capacityCost; // Ensure no negative RAM cost
}

// Function to set up live cost calculation
function setupLiveCostCalculation() {
  const planSelect = document.getElementById("server-plan");
  const playerPreset = document.getElementById("player-preset");
  const customCapacityInput = document.getElementById("custom-capacity");
  const ramPreset = document.getElementById("ram-preset");
  const customRamInput = document.getElementById("custom-ram");
  const costDisplay = document.getElementById("calculated-cost");

  // If any required element is missing, do not proceed (prevents errors on non-server pages)
  if (
    !planSelect ||
    !playerPreset ||
    !customCapacityInput ||
    !ramPreset ||
    !customRamInput ||
    !costDisplay
  ) {
    return;
  }

  function updateCost() {
    const selectedPlan = planSelect.value;
    const capacity =
      playerPreset.value === "custom"
        ? parseInt(customCapacityInput.value, 10) || 0
        : parseInt(playerPreset.value, 10) || 0;
    const ram =
      ramPreset.value === "custom"
        ? parseInt(customRamInput.value, 10) || 0
        : parseInt(ramPreset.value, 10) || 0;

    // Validate inputs and update red text
    validateInputs(capacity, ram, customCapacityInput, customRamInput);

    const cost = calculateCost(selectedPlan, capacity, ram);
    costDisplay.textContent = `${cost.toFixed(2)}€`;
  }

  planSelect.addEventListener("change", updateCost);
  playerPreset.addEventListener("change", () => {
    const customCapacityContainer = document.getElementById(
      "custom-capacity-container"
    );
    if (playerPreset.value === "custom") {
      customCapacityContainer.style.display = "block";
    } else {
      customCapacityContainer.style.display = "none";
      customCapacityInput.value = ""; // Reset custom input
    }
    updateCost();
  });
  customCapacityInput.addEventListener("input", updateCost);

  ramPreset.addEventListener("change", () => {
    const customRamContainer = document.getElementById("custom-ram-container");
    if (ramPreset.value === "custom") {
      customRamContainer.style.display = "block";
    } else {
      customRamContainer.style.display = "none";
      customRamInput.value = ""; // Reset custom input
    }
    updateCost();
  });
  customRamInput.addEventListener("input", updateCost);
}

// Function to set up the player preset dropdown
function setupPlayerPresetDropdown() {
  const playerPreset = document.getElementById("player-preset");
  const presets = [10, 50, 100, 500, 1000]; // Example presets
  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset;
    option.textContent = `${preset} players`;
    playerPreset.appendChild(option);
  });
  const customOption = document.createElement("option");
  customOption.value = "custom";
  customOption.textContent = "Custom";
  playerPreset.appendChild(customOption);
}

// Function to set up the RAM preset dropdown
function setupRamPresetDropdown() {
  const ramPreset = document.getElementById("ram-preset");
  const presets = [2, 4, 8, 16, 32]; // Example RAM presets
  presets.forEach((preset) => {
    const option = document.createElement("option");
    option.value = preset;
    option.textContent = `${preset} GB RAM`;
    ramPreset.appendChild(option);
  });
  const customOption = document.createElement("option");
  customOption.value = "custom";
  customOption.textContent = "Custom";
  ramPreset.appendChild(customOption);
}

// Function to display stored servers with live price updates
function displayStoredServers() {
  const serverListContainer = document.getElementById("server-list-container");
  if (!serverListContainer) return;

  // Clear existing content
  serverListContainer.innerHTML = "";

  // Get servers from local storage
  const servers = JSON.parse(localStorage.getItem("servers")) || [];

  if (servers.length === 0) {
    serverListContainer.innerHTML = "<p>No servers currently available.</p>";
    return;
  }

  // Display each server
  servers.forEach((server, index) => {
    const serverItem = document.createElement("div");
    serverItem.className = "server-item";

    serverItem.innerHTML = `
      <h3>Server: <input type="text" value="${
        server.name
      }" class="server-name-input" /></h3>
      <p>Type: 
        <select class="server-type-select">
          <option value="minecraft" ${
            server.type === "minecraft" ? "selected" : ""
          }>Minecraft</option>
          <option value="rust" ${
            server.type === "rust" ? "selected" : ""
          }>Rust</option>
          <option value="ark" ${
            server.type === "ark" ? "selected" : ""
          }>ARK</option>
          <option value="subnautica" ${
            server.type === "subnautica" ? "selected" : ""
          }>Subnautica</option>
          <option value="counter-strike" ${
            server.type === "counter-strike" ? "selected" : ""
          }>Counter Strike</option>
        </select>
      </p>
      <p>Region: 
        <select class="server-region-select">
          <option value="us-east" ${
            server.region === "us-east" ? "selected" : ""
          }>US East</option>
          <option value="us-west" ${
            server.region === "us-west" ? "selected" : ""
          }>US West</option>
          <option value="europe" ${
            server.region === "europe" ? "selected" : ""
          }>Europe</option>
          <option value="asia" ${
            server.region === "asia" ? "selected" : ""
          }>Asia</option>
        </select>
      </p>
      <p>Capacity: 
        <input type="number" value="${
          server.capacity
        }" class="server-capacity-input" min="1" max="1000" /> players
        <span style="color: red; font-size: 0.9rem; display: none;">No more than 1000</span>
      </p>
      <p>RAM: 
        <input type="number" value="${
          server.ram
        }" class="server-ram-input" min="1" max="64" /> GB
        <span style="color: red; font-size: 0.9rem; display: none;">No more than 64 GB</span>
      </p>
      <p>Plan: <strong>${capitalize(server.plan)}</strong></p>
      <p class="monthly-cost">Monthly Cost: <span>${server.price}€</span></p>
      <button class="edit-button" onclick="updateServer(${index})">Save Changes</button>
      <button class="delete-button" onclick="deleteServer(${index})">Delete</button>
    `;

    // Add event listeners for live price updates
    const capacityInput = serverItem.querySelector(".server-capacity-input");
    const ramInput = serverItem.querySelector(".server-ram-input");
    const monthlyCostDisplay = serverItem.querySelector(".monthly-cost span");

    const updateLiveCost = () => {
      const updatedCapacity = parseInt(capacityInput.value, 10) || 0;
      const updatedRam = parseInt(ramInput.value, 10) || 0;

      // Validate inputs and update red text
      validateInputs(updatedCapacity, updatedRam, capacityInput, ramInput);

      const updatedPrice = calculateCost(
        server.plan,
        updatedCapacity,
        updatedRam
      );
      monthlyCostDisplay.textContent = `${updatedPrice.toFixed(2)}€`;
    };

    capacityInput.addEventListener("input", updateLiveCost);
    ramInput.addEventListener("input", updateLiveCost);

    serverListContainer.appendChild(serverItem);
  });
}

// Function to update a server's details
function updateServer(index) {
  const servers = JSON.parse(localStorage.getItem("servers")) || [];
  const serverItem = document.querySelectorAll(".server-item")[index];

  const updatedName = serverItem.querySelector(".server-name-input").value;
  const updatedType = serverItem.querySelector(".server-type-select").value;
  const updatedRegion = serverItem.querySelector(".server-region-select").value;
  const updatedCapacity = parseInt(
    serverItem.querySelector(".server-capacity-input").value,
    10
  );
  const updatedRam = parseInt(
    serverItem.querySelector(".server-ram-input").value,
    10
  );

  // Validate inputs and update red text
  const capacityInput = serverItem.querySelector(".server-capacity-input");
  const ramInput = serverItem.querySelector(".server-ram-input");
  if (!validateInputs(updatedCapacity, updatedRam, capacityInput, ramInput)) {
    return;
  }

  // Update the server details
  servers[index].name = updatedName;
  servers[index].type = updatedType;
  servers[index].region = updatedRegion;
  servers[index].capacity = updatedCapacity;
  servers[index].ram = updatedRam;

  // Recalculate the monthly cost
  const updatedPrice = calculateCost(
    servers[index].plan,
    updatedCapacity,
    updatedRam
  );
  servers[index].price = updatedPrice.toFixed(2);

  // Save the updated servers to local storage
  localStorage.setItem("servers", JSON.stringify(servers));

  // Refresh the server list
  displayStoredServers();
}

// Function to delete a server
function deleteServer(index) {
  let servers = JSON.parse(localStorage.getItem("servers")) || [];
  servers.splice(index, 1); // Remove the server at the specified index
  localStorage.setItem("servers", JSON.stringify(servers));
  displayStoredServers();
}

// Helper function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper to get settings object from localStorage
function getSettings() {
  let settings = {};
  try {
    settings = JSON.parse(localStorage.getItem('settings')) || {};
  } catch (e) {
    settings = {};
  }
  return settings;
}

// Helper to save settings object to localStorage
function saveSettings(settings) {
  localStorage.setItem('settings', JSON.stringify(settings));
}

// Attach event listener to the form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".styled-form");
  if (form) {
    form.addEventListener("submit", createServer);
    init(); // Only call init if the form exists (server page)
  } else {
    // On pages like linktree, only apply theme if stored
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme && themes[storedTheme]) {
      applyTheme(storedTheme);
    }
  }
});

const themes = {
  green:   { main: "#449B3A"},
  blue:    { main: "#00357F"},
  red:     { main: "#E6141C"},
  yellow:  { main: "#FFF04F"},
  purple:  { main: "#4A1FA5"},
  orange:  { main: "#FF401E"},
  pink:    { main: "#D63384"},
  cyan:    { main: "#00BFFF"},
  brown:   { main: "#8B4513"},
  gray:    { main: "#808080"},
  black:   { main: "#000000"},
  white:   { main: "#FFFFFF"},
  // Add more themes as needed
};
function applyTheme(name) {
  let settings = getSettings();
  if (!name) {
    name = settings.theme || 'cyan';
    if (!name) return; // No theme to apply
  }
  const theme = themes[name];
  if (!theme) return console.warn("Unknown theme:", name);

  document.documentElement.style.setProperty('--main', theme.main);
  settings.theme = name;
  saveSettings(settings);

  // Update Jyurika and Linktree logos if present on the page
  var jyurikaLogo = document.querySelector('a[href*="jyurika"] .button-image, img[alt="Jyurika"]');
  if (jyurikaLogo && theme.jyurikaLogo) {
    jyurikaLogo.src = theme.jyurikaLogo;
  }
  var linktreeLogo = document.querySelector('a[href*="linktree"] .button-image, img[alt="Linktree"]');
  if (linktreeLogo && theme.linktreeLogo) {
    linktreeLogo.src = theme.linktreeLogo;
  }
}

// Home page: update all images based on theme
function updateHomeLogos(themeName) {
  if (!themeName) themeName = localStorage.getItem('theme') || 'cyan';

  // Jyurika logo
  var jyurikaLogo = document.getElementById('jyurika-logo');
  if (jyurikaLogo) {
    var jyurikaPath = `../assets/${themeName}/Jyurika_Trans.png`;
    var jyurikaFallback = `../assets/gray/Jyurika_Trans.png`;
    var jyurikaDepri = `../assets/gray/JyurixDepri.png`;
    function setJyuLogo(paths) {
      if (!paths.length) return;
      var path = paths.shift();
      var img = new window.Image();
      img.onload = function() {
        jyurikaLogo.src = path;
      };
      img.onerror = function() {
        setJyuLogo(paths);
      };
      img.src = path;
    }
    setJyuLogo([jyurikaPath, jyurikaFallback, jyurikaDepri]);
    jyurikaLogo.alt = "Jyurika";
  }
  // Linktree logo
  var linktreeLogo = document.getElementById('linktree-logo');
  if (linktreeLogo) {
    var linktreePath = `../assets/${themeName}/Linktree_Trans.png`;
    var linktreeFallback = `../assets/gray/Linktree_Trans.png`;
    var linktreeDepri = `../assets/gray/JyurixDepri.png`;
    function setLinktreeLogo(paths) {
      if (!paths.length) return;
      var path = paths.shift();
      var img = new window.Image();
      img.onload = function() {
        linktreeLogo.src = path;
      };
      img.onerror = function() {
        setLinktreeLogo(paths);
      };
      img.src = path;
    }
    setLinktreeLogo([linktreePath, linktreeFallback, linktreeDepri]);
  }
  // Main logo (Logo.png/Logo1.png for pink sheep)
  var mainLogo = document.getElementById('main-logo');
  if (mainLogo) {
    if (themeName === "pink" && Math.floor(Math.random() * 100) === 0) {
      mainLogo.src = `../assets/pink/Logo1.png`;
      mainLogo.alt = "RARE Logo (Pink Sheep!)";
    } else {
      var mainLogoPath = `../assets/${themeName}/Logo.png`;
      var mainLogoFallback = `../assets/gray/Logo.png`;
      var mainLogoDepri = `../assets/gray/JyurixDepri.png`;
      function setMainLogo(paths) {
        if (!paths.length) return;
        var path = paths.shift();
        var img = new window.Image();
        img.onload = function() {
          mainLogo.src = path;
        };
        img.onerror = function() {
          setMainLogo(paths);
        };
        img.src = path;
      }
      setMainLogo([mainLogoPath, mainLogoFallback, mainLogoDepri]);
      mainLogo.alt = "Logo";
    }
  }
  // Add more themed images here as needed, following the same pattern:
  // var anotherImg = document.getElementById('another-img-id');
  // if (anotherImg) { anotherImg.src = `../assets/${themeName}/AnotherImage.png`; }
}

// Initial logo update on page load (for home)
document.addEventListener("DOMContentLoaded", function() {
  let settings = getSettings();
  if (
    document.getElementById('jyurika-logo') ||
    document.getElementById('linktree-logo') ||
    document.getElementById('main-logo')
    // add more IDs here if you add more themed images
  ) {
    var theme = settings.theme || 'cyan';
    updateHomeLogos(theme);
  }
});

// Apply theme on page load if stored in settings
document.addEventListener("DOMContentLoaded", () => {
  let settings = getSettings();
  if (settings.theme && themes[settings.theme]) {
    applyTheme(settings.theme);
  }
});

// Settings page theme dropdown logic (no duplicates)
document.addEventListener("DOMContentLoaded", () => {
  // Settings page theme dropdown logic
  const themeSelect = document.getElementById('theme-select');
  const themePreview = document.getElementById('theme-preview');
  if (themeSelect && themePreview && typeof themes === "object") {
    // Populate dropdown
    themeSelect.innerHTML = "";
    for (const key in themes) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      themeSelect.appendChild(opt);
    }

    function setPreviewColor(themeName) {
      if (themes[themeName]) {
        themePreview.style.background = themes[themeName].main;
      }
    }

    // Set initial value from settings or default
    let settings = getSettings();
    if (settings.theme && themes[settings.theme]) {
      themeSelect.value = settings.theme;
      setPreviewColor(settings.theme);
    } else {
      themeSelect.value = "cyan";
      setPreviewColor("cyan");
    }

    themeSelect.addEventListener('change', function() {
      const selected = themeSelect.value;
      setPreviewColor(selected);
      if (typeof applyTheme === "function") {
        applyTheme(selected);
      }
    });

    // Also update preview if theme is changed elsewhere
    document.addEventListener("DOMContentLoaded", function() {
      let settings = getSettings();
      if (settings.theme && themes[settings.theme]) {
        setPreviewColor(settings.theme);
        themeSelect.value = settings.theme;
      }
    });
  }
});

// Text stroke toggle logic for settings page
document.addEventListener("DOMContentLoaded", function() {
  const strokeToggle = document.getElementById('stroke-toggle');
  if (strokeToggle) {
    let settings = getSettings();
    // Set initial state from settings or default false (off)
    if (!('text-stroke' in settings) || settings['text-stroke'] === false || settings['text-stroke'] === "false") {
      strokeToggle.checked = false;
      document.body.classList.add('no-text-stroke');
    } else {
      strokeToggle.checked = true;
      document.body.classList.remove('no-text-stroke');
    }

    strokeToggle.addEventListener('change', function() {
      let settings = getSettings();
      if (strokeToggle.checked) {
        settings['text-stroke'] = true;
        document.body.classList.remove('no-text-stroke');
      } else {
        settings['text-stroke'] = false;
        document.body.classList.add('no-text-stroke');
      }
      saveSettings(settings);
    });
  }

  // Apply on page load everywhere
  let settings = getSettings();
  if (!('text-stroke' in settings) || settings['text-stroke'] === false || settings['text-stroke'] === "false") {
    document.body.classList.add('no-text-stroke');
  } else {
    document.body.classList.remove('no-text-stroke');
  }
});

// Dynamically update favicon to match the current theme, fallback to gray or JyurixDepri.png if not found
function updateFavicon(themeName) {
  if (!themeName) {
    let settings = getSettings ? getSettings() : {};
    themeName = settings.theme || localStorage.getItem('theme') || 'cyan';
  }
  // Remove all favicon links
  document.querySelectorAll('link[rel*="icon"]').forEach(link => link.remove());

  // Compute correct relative path for favicon, robust for any folder depth
  function getFaviconBasePath() {
    // Find the path to /assets/ from current location
    var path = window.location.pathname;
    var assetsIdx = path.lastIndexOf('/assets/');
    if (assetsIdx !== -1) {
      // Already in /assets/, so use './'
      return './';
    }
    // Count how many folders deep we are from the root
    var depth = path.split('/').length - 2; // -2: one for leading slash, one for file
    var up = '';
    for (var i = 0; i < depth; i++) up += '../';
    return up + 'assets/';
  }

  var basePath = getFaviconBasePath();
  var faviconPath = `${basePath}${themeName}/JY.png`;
  var fallbackPath = `${basePath}gray/JY.png`;
  var depriPath = `${basePath}gray/JyurixDepri.png`;

  // Try to load faviconPath, fallback to gray, then JyurixDepri
  function setFavicon(pathArr) {
    if (!pathArr.length) return;
    var path = pathArr.shift();
    var img = new window.Image();
    img.onload = function() {
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/png';
      favicon.href = path + '?v=' + Date.now();
      document.head.appendChild(favicon);
    };
    img.onerror = function() {
      setFavicon(pathArr);
    };
    img.src = path;
  }
  setFavicon([faviconPath, fallbackPath, depriPath]);
}

// Patch applyTheme to also update favicon
(function() {
  var origApplyTheme = window.applyTheme;
  window.applyTheme = function(name) {
    if (origApplyTheme) origApplyTheme(name);
    updateHomeLogos(name);
    updateFavicon(name);
  };
})();

// Initial favicon update on page load
document.addEventListener("DOMContentLoaded", function() {
  updateFavicon();
});
