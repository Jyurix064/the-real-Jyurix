// Pricing details for each plan
const pricing = {
  basic: { base: 4.50, ram: 2 }, // 2GB RAM
  standard: { base: 9.00, ram: 4 }, // 4GB RAM
  premium: { base: 18.00, ram: 8 }, // 8GB RAM
  ultimate: { base: 25.00, ram: 16 }, // 16GB RAM
  enterprise: { base: 50.00, ram: 32 }, // 32GB RAM
};

// Function to initialize the application
function init() {
  displayStoredServers();
  setupLiveCostCalculation();
  setupPlayerPresetDropdown();
  setupRamPresetDropdown();
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
  const serverCapacity =
    playerPreset === "custom"
      ? parseInt(document.getElementById("custom-capacity").value, 10)
      : parseInt(playerPreset, 10);

  // Determine the RAM based on the selected preset or custom input
  const ramPreset = document.getElementById("ram-preset").value;
  const serverRam =
    ramPreset === "custom"
      ? parseInt(document.getElementById("custom-ram").value, 10)
      : parseInt(ramPreset, 10);

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
  alert(`Server created successfully! Monthly Price: ${monthlyPrice.toFixed(2)}€`);
}

// Function to calculate the cost based on the plan, capacity, and RAM
function calculateCost(plan, capacity, ram) {
  const basePrice = pricing[plan].base;
  const ramCost = (ram - pricing[plan].ram) * 0.50; // 0.50€ per GB of additional RAM
  const capacityCost = capacity * 0.10; // 0.10€ per player
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
    const cost = calculateCost(selectedPlan, capacity, ram);
    costDisplay.textContent = `${cost.toFixed(2)}€`;
  }

  planSelect.addEventListener("change", updateCost);
  playerPreset.addEventListener("change", () => {
    const customCapacityContainer = document.getElementById("custom-capacity-container");
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

// Function to display stored servers
function displayStoredServers() {
  const serverListContainer = document.getElementById("server-list");
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
      <h3>${server.name}</h3>
      <p>Type: ${server.type}</p>
      <p>Region: ${server.region}</p>
      <p>Capacity: ${server.capacity} players</p>
      <p>RAM: ${server.ram} GB</p>
      <p>Plan: ${capitalize(server.plan)} - ${server.price}€/Month</p>
      <button onclick="deleteServer(${index})" class="delete-button">Delete</button>
    `;
    serverListContainer.appendChild(serverItem);
  });
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

// Attach event listener to the form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".styled-form");
  if (form) {
    form.addEventListener("submit", createServer);
  }
  init();
});
