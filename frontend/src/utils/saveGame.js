// saveGame.js
// Utility for modular save game logic (API or localStorage)

const API_URL = "http://localhost:8000/api/game/save"; // Adjust as needed

async function fetchLastSaved(token, characterId) {
  try {
    const response = await fetch(
      `${API_URL}/latest?characterId=${characterId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error("No backend save");
    const data = await response.json();
    console.log("Fetched last saved stats:", data);
    return data;
  } catch (error) {
    console.error("Error fetching last saved stats:", error);
    return null;
  }
}

function getLocalSave() {
  try {
    return JSON.parse(localStorage.getItem("lastSave"));
  } catch {
    return null;
  }
}

function setLocalSave(data) {
  localStorage.setItem("lastSave", JSON.stringify(data));
}

function statsChanged(current, last) {
  if (!last) return true;
  const changed = JSON.stringify(current) !== JSON.stringify(last);
  console.log("Stats changed:", changed);
  return changed;
}

export async function saveProgress(currentStats, token = null) {
  // Try backend first if token provided
  if (token) {
    const last = await fetchLastSaved(token, currentStats.characterId);
    console.log("Current stats:", currentStats);
    console.log("Last saved stats:", last);
    if (!statsChanged(currentStats, last)) {
      return { saved: false, method: "backend" };
    }
    // Save to backend
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(currentStats),
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend save error:", errorData);
      throw new Error("Failed to save to backend");
    }
    return { saved: true, method: "backend" };
  } else {
    // Fallback to localStorage
    const last = getLocalSave();
    console.log("Current stats:", currentStats);
    console.log("Last saved stats:", last);
    if (!statsChanged(currentStats, last)) {
      return { saved: false, method: "local" };
    }
    setLocalSave(currentStats);
    return { saved: true, method: "local" };
  }
}
