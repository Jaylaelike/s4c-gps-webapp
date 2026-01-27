// Import Leaflet and PapaParse libraries
const L = window.L
const Papa = window.Papa

// Unregister any service workers to prevent caching
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister()
      console.log('Service Worker unregistered')
    }
  })
}

// Clear all caches on load
if ('caches' in window) {
  caches.keys().then(function (names) {
    for (let name of names) {
      caches.delete(name)
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map", {
    center: [10.462813, 99.093706],
    zoom: 5,
    zoomControl: false,
  })

  // Add a modern, light-themed tile layer from CartoDB
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map)

  // Add zoom control at the top right
  L.control
    .zoom({
      position: "topright",
      zoomInTitle: "Zoom in",
      zoomOutTitle: "Zoom out"
    })
    .addTo(map)

  // Add scale control to show map scale at the top right
  L.control
    .scale({
      position: "topright",
      metric: true,
      imperial: false,
      maxWidth: 200,
    })
    .addTo(map)

  // Updated color scale based on 3-level S4C classification
  function getColor(s4c) {
    if (s4c <= 0.25) return "#3b82f6" // Blue (S4C ≤ 0.25)
    if (s4c <= 0.4) return "#fbbf24" // Yellow (0.25 < S4C ≤ 0.4)
    return "#ef4444" // Red (S4C > 0.4)
  }

  // S4C level classification function
  function getS4CLevel(s4c) {
    if (s4c <= 0.25) return "good"
    if (s4c <= 0.4) return "medium"
    return "bad"
  }

  // Filter state
  const s4cFilter = {
    good: true,
    medium: true,
    bad: true,
  }

  // Station filter state
  let selectedStation = "all"


  // Global data storage
  let allStationData = {}
  let satelliteGroups = {}
  let allTimes = []
  let currentTimeIndex = 0
  let isPlaying = true
  let animationInterval

  // Map layers
  const trajectoryLayer = L.layerGroup().addTo(map)
  const currentPointLayer = L.layerGroup().addTo(map)
  const pathLayer = L.layerGroup().addTo(map)

  // List of station CSV files
  const stationFiles = [
    "CHAN_S4C_last15min.csv",
    "CHMA_S4C_last15min.csv",
    "DPT9_S4C_last15min.csv",
    "NKSW_S4C_last15min.csv",
    "PJRK_S4C_last15min.csv",
    "SISK_S4C_last15min.csv",
    "SOKA_S4C_last15min.csv",
    "SRTN_S4C_last15min.csv",
    "TP00_S4C_last15min.csv",
    "UDON_S4C_last15min.csv",
    "UTTD_S4C_last15min.csv"
  ]

  // Extract station name from filename
  function getStationName(filename) {
    return filename.split('_')[0]
  }

  // Initialize UI controls
  function initializeControls() {
    // Satellite monitor toggle
    const satelliteToggleBtn = document.getElementById("satellite-toggle-btn")
    const satellitePanel = document.getElementById("satellite-panel")

    if (satelliteToggleBtn && satellitePanel) {
      satelliteToggleBtn.addEventListener("click", () => {
        satellitePanel.classList.toggle("hidden")
      })
    }

    // Manual refresh button
    const refreshBtn = document.getElementById("refresh-data-btn")
    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        refreshBtn.disabled = true
        refreshBtn.innerHTML = "⏳ Loading..."
        refreshBtn.style.opacity = "0.6"
        await autoRefreshData()
        refreshBtn.disabled = false
        refreshBtn.innerHTML = "🔄 Refresh"
        refreshBtn.style.opacity = "1"
      })
    }

    // Keyboard shortcut: Ctrl+R or Cmd+R to force refresh (prevent default browser refresh)
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        if (refreshBtn && !refreshBtn.disabled) {
          refreshBtn.click()
        }
      }
    })

    // Station selector
    const stationSelector = document.getElementById("station-selector")
    if (stationSelector) {
      stationSelector.addEventListener("change", (e) => {
        selectedStation = e.target.value
        console.log("Station filter changed to:", selectedStation)
        rebuildVisualization()
      })
    }

    // Filter controls
    ;["good", "medium", "bad"].forEach((level) => {
      const checkbox = document.getElementById(`filter-${level}`)
      if (checkbox) {
        checkbox.addEventListener("change", (e) => {
          s4cFilter[level] = e.target.checked
          animateTrajectory()
        })
      }
    })

    // Panel close buttons
    const panelControls = [
      { btnId: "close-satellite-btn", panelId: "satellite-panel" },
    ]

    panelControls.forEach(({ btnId, panelId }) => {
      const btn = document.getElementById(btnId)
      const panel = document.getElementById(panelId)
      if (btn && panel) {
        btn.addEventListener("click", () => {
          panel.classList.add("hidden")
        })
      }
    })
  }

  // Update satellite count display
  function updateSatelliteCount(activeSatellites) {
    const counts = {
      total: activeSatellites.length,
      good: 0,
      medium: 0,
      bad: 0,
    }

    activeSatellites.forEach((satellite) => {
      const level = getS4CLevel(satellite.s4c)
      counts[level]++
    })

      // Update UI
      ;["total", "good", "medium", "bad"].forEach((type) => {
        const element = document.getElementById(`${type}-count`)
        if (element) {
          element.textContent = counts[type]
          element.style.transform = "scale(1.1)"
          setTimeout(() => {
            element.style.transform = "scale(1)"
          }, 200)
        }
      })
  }


  // Auto-refresh interval (check for updates every 30 seconds)
  const AUTO_REFRESH_INTERVAL = 30000 // 30 seconds
  let lastLoadTime = Date.now()
  let refreshCountdown = AUTO_REFRESH_INTERVAL / 1000

  // Update countdown display
  function updateRefreshCountdown() {
    const lastUpdateEl = document.getElementById("last-update")
    if (lastUpdateEl) {
      const elapsed = Math.floor((Date.now() - lastLoadTime) / 1000)
      const remaining = Math.max(0, Math.floor(AUTO_REFRESH_INTERVAL / 1000) - elapsed)
      lastUpdateEl.textContent = `Next refresh: ${remaining}s`
    }
  }

  // Start countdown timer (updates every second)
  setInterval(updateRefreshCountdown, 1000)

  // Load all station data with aggressive cache busting
  async function loadAllStations() {
    console.log("Loading data from all stations...")
    const stationSelector = document.getElementById("station-selector")

    // Clear existing station data
    allStationData = {}

    for (const filename of stationFiles) {
      const stationName = getStationName(filename)

      try {
        // Add multiple cache-busting parameters and headers
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(7)
        const response = await fetch(`${filename}?t=${timestamp}&r=${random}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        })

        if (!response.ok) {
          console.warn(`Failed to load ${filename}`)
          continue
        }

        const csvText = await response.text()

        await new Promise((resolve) => {
          Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
              const data = results.data.filter((row) => row.Lat && row.Lon && row.S4C && row.UTC)

              // Transform data to match expected format
              const transformedData = data.map(row => ({
                Satellite: row.SV,
                Time: row.UTC,
                Lat: row.Lat,
                Lon: row.Lon,
                S4C: row.S4C,
                Station: stationName
              }))

              allStationData[stationName] = transformedData
              console.log(`Loaded ${transformedData.length} records from ${stationName}`)

              // Add station to selector if not already present
              if (stationSelector && !Array.from(stationSelector.options).some(opt => opt.value === stationName)) {
                const option = document.createElement("option")
                option.value = stationName
                option.textContent = stationName
                stationSelector.appendChild(option)
              }

              resolve()
            }
          })
        })
      } catch (error) {
        console.error(`Error loading ${filename}:`, error)
      }
    }

    console.log(`Loaded ${Object.keys(allStationData).length} stations`)
    lastLoadTime = Date.now()
    rebuildVisualization()
  }

  // Auto-refresh function
  async function autoRefreshData() {
    console.log("Auto-refreshing data...")
    const lastUpdateEl = document.getElementById("last-update")
    const currentStation = selectedStation
    const currentTime = currentTimeIndex
    const wasPlaying = isPlaying

    // Show loading indicator
    if (lastUpdateEl) {
      lastUpdateEl.textContent = "🔄 Refreshing data..."
      lastUpdateEl.style.color = "#3b82f6"
    }

    // Pause animation during refresh
    if (isPlaying) {
      isPlaying = false
      if (animationInterval) clearInterval(animationInterval)
    }

    try {
      await loadAllStations()

      // Restore state
      selectedStation = currentStation
      if (wasPlaying) {
        isPlaying = true
        startAnimation()
      } else {
        // Try to restore similar time position
        if (allTimes.length > 0) {
          currentTimeIndex = Math.min(currentTime, allTimes.length - 1)
          animateTrajectory()
          updateProgress()
        }
      }

      // Show success indicator briefly
      if (lastUpdateEl) {
        lastUpdateEl.textContent = "✓ Data updated!"
        lastUpdateEl.style.color = "#10b981"
        setTimeout(() => {
          lastUpdateEl.style.color = "#6b7280"
        }, 2000)
      }

      console.log("Data refresh complete")
    } catch (error) {
      console.error("Error during auto-refresh:", error)
      if (lastUpdateEl) {
        lastUpdateEl.textContent = "⚠ Refresh failed"
        lastUpdateEl.style.color = "#ef4444"
      }
    }
  }

  // Start auto-refresh timer
  setInterval(autoRefreshData, AUTO_REFRESH_INTERVAL)

  // Rebuild visualization based on selected station
  function rebuildVisualization() {
    console.log("Rebuilding visualization for station:", selectedStation)

    // Clear existing layers
    trajectoryLayer.clearLayers()
    currentPointLayer.clearLayers()
    pathLayer.clearLayers()

    // Get filtered data
    let filteredData = []
    if (selectedStation === "all") {
      // Combine all station data
      Object.values(allStationData).forEach(stationData => {
        filteredData = filteredData.concat(stationData)
      })
    } else {
      filteredData = allStationData[selectedStation] || []
    }

    if (filteredData.length === 0) {
      console.warn("No data available for selected station")
      return
    }

    // Group data by satellite
    satelliteGroups = {}
    filteredData.forEach((row) => {
      const key = `${row.Satellite}_${row.Station}`
      if (!satelliteGroups[key]) {
        satelliteGroups[key] = []
      }
      satelliteGroups[key].push(row)
    })

    // Sort by time
    Object.keys(satelliteGroups).forEach((satellite) => {
      satelliteGroups[satellite].sort((a, b) => new Date(a.Time) - new Date(b.Time))
    })

    // Get all unique times
    allTimes = [...new Set(filteredData.map((row) => row.Time))].sort()
    console.log(`Found ${Object.keys(satelliteGroups).length} satellite tracks with ${allTimes.length} time points`)

    // Create full trajectory lines
    Object.keys(satelliteGroups).forEach((satelliteKey) => {
      const satelliteData = satelliteGroups[satelliteKey]
      const coordinates = satelliteData.map((row) => [row.Lat, row.Lon])

      const fullTrajectory = L.polyline(coordinates, {
        color: "#808080",
        weight: 2,
        opacity: 0.3,
        smoothFactor: 1,
      }).addTo(trajectoryLayer)

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; font-size: 14px;">
          <b>Satellite:</b> ${satelliteData[0].Satellite}<br>
          <b>Station:</b> ${satelliteData[0].Station}<br>
          <b>Data Points:</b> ${satelliteData.length}<br>
          <b>Time Range:</b> ${satelliteData[0].Time} to ${satelliteData[satelliteData.length - 1].Time}<br>
          <b>S4C Range:</b> ${Math.min(...satelliteData.map((d) => d.S4C)).toFixed(3)} - ${Math.max(...satelliteData.map((d) => d.S4C)).toFixed(3)}
        </div>
      `
      fullTrajectory.bindPopup(popupContent)
    })

    // Reset animation
    currentTimeIndex = 0
    initializeTimeControl()
    animateTrajectory()
    startAnimation()
  }

  // Initialize time control
  function initializeTimeControl() {
    const slider = document.getElementById("time-slider")
    const playPauseBtn = document.getElementById("play-pause-btn")
    const resetBtn = document.getElementById("reset-btn")
    const startTimeEl = document.getElementById("start-time")
    const endTimeEl = document.getElementById("end-time")

    if (slider) {
      slider.max = Math.max(0, allTimes.length - 1)
      slider.value = 0
      slider.removeEventListener("input", handleSliderInput)
      slider.addEventListener("input", handleSliderInput)
    }

    if (startTimeEl && allTimes.length > 0) {
      startTimeEl.textContent = formatDateTime(allTimes[0])
    }

    if (endTimeEl && allTimes.length > 0) {
      endTimeEl.textContent = formatDateTime(allTimes[allTimes.length - 1])
    }

    if (playPauseBtn) {
      playPauseBtn.removeEventListener("click", togglePlayPause)
      playPauseBtn.addEventListener("click", togglePlayPause)
    }

    if (resetBtn) {
      resetBtn.removeEventListener("click", resetAnimation)
      resetBtn.addEventListener("click", resetAnimation)
    }
  }

  function handleSliderInput(e) {
    currentTimeIndex = Number.parseInt(e.target.value)
    animateTrajectory()
    updateProgress()
  }

  function formatDateTime(dateString) {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  function updateProgress() {
    const slider = document.getElementById("time-slider")
    const progressEl = document.getElementById("current-progress")

    if (slider) slider.value = currentTimeIndex
    if (progressEl && allTimes.length > 0) {
      const progress = Math.round((currentTimeIndex / (allTimes.length - 1)) * 100)
      progressEl.textContent = `${progress}%`
    }
  }

  function togglePlayPause() {
    const playPauseBtn = document.getElementById("play-pause-btn")
    isPlaying = !isPlaying

    if (isPlaying) {
      playPauseBtn.innerHTML = "⏸️ Pause"
      startAnimation()
    } else {
      playPauseBtn.innerHTML = "▶️ Play"
      if (animationInterval) clearInterval(animationInterval)
    }
  }

  function resetAnimation() {
    currentTimeIndex = 0
    animateTrajectory()
    updateProgress()
  }

  function startAnimation() {
    if (animationInterval) clearInterval(animationInterval)

    const totalDuration = 20000 // 20 seconds
    const frameInterval = allTimes.length > 0 ? totalDuration / allTimes.length : 1000

    animationInterval = setInterval(() => {
      if (isPlaying && allTimes.length > 0) {
        currentTimeIndex = (currentTimeIndex + 1) % allTimes.length
        animateTrajectory()
        updateProgress()
      }
    }, frameInterval)
  }

  // Main animation function
  function animateTrajectory() {
    currentPointLayer.clearLayers()
    pathLayer.clearLayers()

    if (allTimes.length === 0) {
      return
    }

    const currentTime = allTimes[currentTimeIndex]

    // Update time display
    const timeDisplay = document.getElementById("current-time")
    if (timeDisplay) {
      timeDisplay.textContent = formatDateTime(currentTime)
    }

    const activeSatellites = []

    // Process each satellite
    Object.keys(satelliteGroups).forEach((satelliteKey) => {
      const satelliteData = satelliteGroups[satelliteKey]
      const currentData = satelliteData.filter((row) => new Date(row.Time) <= new Date(currentTime))

      if (currentData.length > 0) {
        const currentPoint = currentData[currentData.length - 1]
        const s4cLevel = getS4CLevel(currentPoint.S4C)

        activeSatellites.push({
          satellite: currentPoint.Satellite,
          station: currentPoint.Station,
          s4c: currentPoint.S4C,
          level: s4cLevel,
          lat: currentPoint.Lat,
          lon: currentPoint.Lon,
        })

        // Apply filter
        if (!s4cFilter[s4cLevel]) return

        // Draw trajectory path
        if (currentData.length > 1) {
          const currentCoordinates = currentData.map((row) => [row.Lat, row.Lon])
          L.polyline(currentCoordinates, {
            color: "#808080",
            weight: 4,
            opacity: 0.9,
            smoothFactor: 1,
          }).addTo(pathLayer)
        }

        // Create satellite marker
        const circleIcon = L.divIcon({
          className: "satellite-circle",
          html: `
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: linear-gradient(135deg, ${getColor(currentPoint.S4C)}, ${getColor(currentPoint.S4C)}dd);
              border: 2px solid #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: 'Inter', sans-serif;
              font-size: 9px;
              font-weight: 700;
              color: white;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              transition: all 0.3s ease;
            ">
              ${currentPoint.Satellite}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const currentMarker = L.marker([currentPoint.Lat, currentPoint.Lon], {
          icon: circleIcon,
        }).addTo(currentPointLayer)

        // Enhanced popup
        const pointPopup = `
          <div style="font-family: 'Inter', sans-serif; font-size: 14px; min-width: 200px;">
            <div style="background: linear-gradient(135deg, ${getColor(currentPoint.S4C)}, ${getColor(currentPoint.S4C)}dd); color: white; padding: 8px; margin: -8px -8px 8px -8px; border-radius: 4px;">
              <b>Satellite ${currentPoint.Satellite}</b>
            </div>
            <div style="margin: 8px 0;"><b>Station:</b> ${currentPoint.Station}</div>
            <div style="margin: 8px 0;"><b>Time:</b> ${currentPoint.Time}</div>
            <div style="margin: 8px 0;"><b>S4C Index:</b> <span style="color: ${getColor(currentPoint.S4C)}; font-weight: bold;">${currentPoint.S4C.toFixed(4)}</span></div>
            <div style="margin: 8px 0;"><b>Level:</b> <span style="text-transform: capitalize; font-weight: 600;">${s4cLevel}</span></div>
            <div style="margin: 8px 0;"><b>Position:</b> ${currentPoint.Lat.toFixed(4)}, ${currentPoint.Lon.toFixed(4)}</div>
          </div>
        `
        currentMarker.bindPopup(pointPopup)
      }
    })

    // Update displays
    updateSatelliteCount(activeSatellites)

  }

  // Initialize application
  initializeControls()
  loadAllStations()
})
