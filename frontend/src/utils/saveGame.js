// saveGame.js
// Utility to save game progress to backend or localStorage

// Function to check if stats have changed
const statsChanged = (current, last) => {
  if (!last) return true;

  // Check if any stat has changed
  const changed =
    current.mentalPoints !== last.mentalPoints ||
    current.energyLevel !== last.energyLevel ||
    current.motivationLevel !== last.motivationLevel ||
    current.focusLevel !== last.focusLevel ||
    current.workDayCount !== last.workDayCount ||
    current.actionsUsed !== last.actionsUsed;

  console.log("Stats changed:", changed);
  return changed;
};

// Function to save progress
export const saveProgress = async (currentStats) => {
  try {
    // Get token from localStorage for authentication
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return { saved: false, method: "backend" };
    }

    // Fetch the last saved stats from the backend (GET request)
    const characterId = currentStats.characterId;
    const response = await fetch(
      `/api/game/save/latest?characterId=${characterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the backend response as JSON to get the last saved stats object
    const lastSavedStats = await response.json();
    console.log("Current stats:", currentStats);
    console.log("Last saved stats:", lastSavedStats);

    // Compare current and last saved stats to see if anything has changed
    const hasChanged = statsChanged(currentStats, lastSavedStats);

    // Check if actions have been used (prevents action cheesing)
    const actionsUsed = currentStats.actionsUsed || 0;
    const lastActionsUsed = lastSavedStats.actionsUsed || 0;

    // Only save if stats changed or actions were used
    if (!hasChanged && actionsUsed <= lastActionsUsed) {
      return { saved: false, method: "backend" };
    }

    // Save to backend (POST request)
    const saveResponse = await fetch("/api/game/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(currentStats),
    });

    if (!saveResponse.ok) {
      throw new Error(`HTTP error! status: ${saveResponse.status}`);
    }

    // If save is successful, return success
    return { saved: true, method: "backend" };
  } catch (error) {
    // If any error occurs above (network/server/etc), we end up here
    console.error("Error saving to backend:", error);

    // Fallback to localStorage
    try {
      // Get the last saved stats from localStorage (if any)
      const lastSavedStats = JSON.parse(
        localStorage.getItem("lastSavedStats") || "{}"
      );
      console.log("Current stats (local):", currentStats);
      console.log("Last saved stats (local):", lastSavedStats);

      // Check if stats have changed
      const hasChanged = statsChanged(currentStats, lastSavedStats);

      // Check if actions have been used
      const actionsUsed = currentStats.actionsUsed || 0;
      const lastActionsUsed = lastSavedStats.actionsUsed || 0;

      // Only save if stats changed or actions were used
      if (!hasChanged && actionsUsed <= lastActionsUsed) {
        return { saved: false, method: "local" };
      }

      // Save to localStorage
      localStorage.setItem("lastSavedStats", JSON.stringify(currentStats));
      return { saved: true, method: "local" };
    } catch (localError) {
      // If saving to localStorage fails, log the error and return failure
      console.error("Error saving to localStorage:", localError);
      return { saved: false, method: "local" };
    }
  }
};
