
const API_URL =
  "https://maps2.bristol.gov.uk/server2/rest/services/ext/ll_community_and_safety/MapServer/21/query" +
  "?where=1%3D1&outFields=TOILET_NAME,ADDRESS,LOCALITY,OPENING_HOURS,DISABLED,BABY_CHANGE&f=json";

const CACHE_KEY = "toiletDataCache";

const tableBody = document.getElementById("toiletTableBody");
const statusMessage = document.getElementById("statusMessage");
const lastUpdated = document.getElementById("lastUpdated");
const areaFilter = document.getElementById("areaFilter");
const accessFilter = document.getElementById("accessFilter");
const refreshBtn = document.getElementById("refreshBtn");

let allToilets = [];

function showError(message) {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
}

function clearError() {
  statusMessage.hidden = true;
  statusMessage.textContent = "";
}

function normaliseRecords(json) {
  return json.features
    .map((f) => f.attributes)
    .filter((a) => a.TOILET_NAME)
    .map((a) => ({
      name: a.TOILET_NAME,
      address: a.ADDRESS || "Not given",
      locality: a.LOCALITY || "Unknown",
      hours: a.OPENING_HOURS || "Not given",
      disabled: (a.DISABLED || "").toUpperCase() === "Y",
      babyChange: (a.BABY_CHANGE || "").toUpperCase() === "Y",
    }));
}

function populateAreaFilter(toilets) {
  const areas = [...new Set(toilets.map((t) => t.locality))].sort();
  areaFilter.innerHTML = '<option value="">All Areas</option>';
  areas.forEach((area) => {
    const opt = document.createElement("option");
    opt.value = area;
    opt.textContent = area;
    areaFilter.appendChild(opt);
  });
}

function badge(value) {
  return value
    ? '<span class="badge-yes">Yes</span>'
    : '<span class="badge-no">No</span>';
}

function renderTable(toilets) {
  tableBody.innerHTML = "";
  if (toilets.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="6">No toilets match the selected filters.</td></tr>';
    return;
  }
  toilets.forEach((t) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${t.name}</td>
      <td>${t.address}</td>
      <td>${t.locality}</td>
      <td>${t.hours}</td>
      <td>${badge(t.disabled)}</td>
      <td>${badge(t.babyChange)}</td>
    `;
    tableBody.appendChild(row);
  });
}

function applyFilters() {
  const area = areaFilter.value;
  const access = accessFilter.value;
  let filtered = allToilets;
  if (area) {
    filtered = filtered.filter((t) => t.locality === area);
  }
  if (access === "disabled") {
    filtered = filtered.filter((t) => t.disabled);
  } else if (access === "baby") {
    filtered = filtered.filter((t) => t.babyChange);
  }
  renderTable(filtered);
}

function setLastUpdated(fromCache) {
  const now = new Date();
  lastUpdated.textContent =
    (fromCache ? "Showing cached data from: " : "Last updated: ") +
    now.toLocaleTimeString();
}

async function loadToilets() {
  clearError();
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("API returned status " + response.status);
    }
    const json = await response.json();
    allToilets = normaliseRecords(json);
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: allToilets, savedAt: Date.now() })
    );
    populateAreaFilter(allToilets);
    applyFilters();
    setLastUpdated(false);
  } catch (err) {
    handleLoadError(err);
  }
}

function handleLoadError(err) {
  console.error("Failed to load toilet data:", err);
  const cachedRaw = localStorage.getItem(CACHE_KEY);
  if (cachedRaw) {
    const cached = JSON.parse(cachedRaw);
    allToilets = cached.data;
    populateAreaFilter(allToilets);
    applyFilters();
    showError(
      "Could not reach the Bristol Open Data API. Showing the last saved data instead."
    );
    lastUpdated.textContent =
      "Showing cached data from: " + new Date(cached.savedAt).toLocaleString();
  } else {
    tableBody.innerHTML = "";
    showError(
      "Could not load toilet data and no cached data is available. Please check your connection and try again."
    );
  }
}

refreshBtn.addEventListener("click", loadToilets);
areaFilter.addEventListener("change", applyFilters);
accessFilter.addEventListener("change", applyFilters);

loadToilets();
