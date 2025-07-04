// Note: Replace with your own API key from OpenWeatherMap
const API_KEY = "524a2f97948a253c8f673eda1149eaad" // Your actual API key

const searchBtn = document.getElementById("searchBtn")
const cityInput = document.getElementById("city-input")
const toggleBtn = document.getElementById("toggleBtn")
const themeLoadingOverlay = document.getElementById("themeLoadingOverlay")

let isSearching = false
let isThemeSwitching = false

// Show search loading in button
function showSearchLoading() {
  searchBtn.disabled = true
  cityInput.disabled = true
  isSearching = true

  // Update button content with spinner
  searchBtn.innerHTML = '<span class="spinner-small"></span><span>Searching...</span>'
}

// Hide search loading in button
function hideSearchLoading() {
  searchBtn.disabled = false
  cityInput.disabled = false
  isSearching = false

  // Restore button content
  searchBtn.innerHTML = '<i class="fa fa-search" aria-hidden="true"></i><span>Search</span>'
}

// Show theme loading
function showThemeLoading() {
  themeLoadingOverlay.classList.add("active")
  toggleBtn.disabled = true
  searchBtn.disabled = true
  cityInput.disabled = true
  isThemeSwitching = true
}

// Hide theme loading
function hideThemeLoading() {
  themeLoadingOverlay.classList.remove("active")
  toggleBtn.disabled = false
  if (!isSearching) {
    searchBtn.disabled = false
    cityInput.disabled = false
  }
  isThemeSwitching = false
}

// Enhanced weather icon mapping function with forecast-specific circular classes
function getWeatherIconData(iconCode, hour, isForForecast = false) {
  const isNight = hour >= 20 || hour < 6 // Night time between 8 PM and 6 AM
  const classPrefix = isForForecast ? "forecast-icon-" : "icon-"

  const iconMap = {
    // Clear sky
    "01d": { icon: "☀️", class: `${classPrefix}sunny`, alt: "Clear sky", fallback: "🌞" },
    "01n": { icon: "🌙", class: `${classPrefix}night`, alt: "Clear night", fallback: "🌜" },

    // Few clouds
    "02d": { icon: "⛅", class: `${classPrefix}partly-cloudy`, alt: "Partly cloudy", fallback: "🌤️" },
    "02n": { icon: "☁️", class: `${classPrefix}night`, alt: "Partly cloudy night", fallback: "🌙☁️" },

    // Scattered clouds - ENHANCED with circular styling
    "03d": { icon: "☁️", class: `${classPrefix}scattered-clouds`, alt: "Scattered clouds", fallback: "🌥️" },
    "03n": { icon: "☁️", class: `${classPrefix}scattered-clouds`, alt: "Scattered clouds night", fallback: "🌥️" },

    // Broken clouds - ENHANCED with circular styling
    "04d": { icon: "☁️", class: `${classPrefix}broken-clouds`, alt: "Broken clouds", fallback: "☁️☁️" },
    "04n": { icon: "☁️", class: `${classPrefix}broken-clouds`, alt: "Broken clouds night", fallback: "☁️☁️" },

    // Shower rain
    "09d": { icon: "🌦️", class: `${classPrefix}rainy`, alt: "Shower rain", fallback: "🌧️" },
    "09n": { icon: "🌧️", class: `${classPrefix}rainy`, alt: "Shower rain night", fallback: "🌦️" },

    // Rain
    "10d": { icon: "🌧️", class: `${classPrefix}rainy`, alt: "Rain", fallback: "🌦️" },
    "10n": { icon: "🌧️", class: `${classPrefix}rainy`, alt: "Rain night", fallback: "🌦️" },

    // Thunderstorm
    "11d": { icon: "⛈️", class: `${classPrefix}rainy`, alt: "Thunderstorm", fallback: "🌩️" },
    "11n": { icon: "⛈️", class: `${classPrefix}rainy`, alt: "Thunderstorm night", fallback: "🌩️" },

    // Snow
    "13d": { icon: "❄️", class: `${classPrefix}cloudy`, alt: "Snow", fallback: "🌨️" },
    "13n": { icon: "❄️", class: `${classPrefix}night`, alt: "Snow night", fallback: "🌨️" },

    // Mist
    "50d": { icon: "🌫️", class: `${classPrefix}cloudy`, alt: "Mist", fallback: "🌁" },
    "50n": { icon: "🌫️", class: `${classPrefix}night`, alt: "Mist night", fallback: "🌁" },
  }

  return (
    iconMap[iconCode] || {
      icon: isNight ? "🌙" : "☀️",
      class: isNight ? `${classPrefix}night` : `${classPrefix}sunny`,
      alt: "Weather",
      fallback: isNight ? "🌜" : "🌞",
    }
  )
}

// Theme toggle functionality with loading
function toggleTheme() {
  if (isThemeSwitching) return

  showThemeLoading()

  setTimeout(() => {
    const body = document.body
    const isDarkTheme = body.classList.toggle("dark-theme")
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light")

    const icon = toggleBtn.querySelector("i")
    icon.classList.toggle("fa-sun", !isDarkTheme)
    icon.classList.toggle("fa-moon", isDarkTheme)

    hideThemeLoading()
  }, 2000) // delay
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light"
  const isDarkTheme = savedTheme === "dark"
  document.body.classList.toggle("dark-theme", isDarkTheme)

  const icon = toggleBtn.querySelector("i")
  icon.classList.toggle("fa-sun", !isDarkTheme)
  icon.classList.toggle("fa-moon", isDarkTheme)
}

// Generate 24-hour time labels
function generate24HourLabels() {
  const hours = []
  for (let i = 0; i < 24; i++) {
    let hour = i
    let period = "AM"

    if (i === 0) {
      hour = 12
    } else if (i === 12) {
      hour = 12
      period = "PM"
    } else if (i > 12) {
      hour = i - 12
      period = "PM"
    }

    hours.push(`${hour}${period}`)
  }
  return hours
}

// Generate synthetic 10-day forecast data with better cloud variety
function generateTenDayForecast(currentWeatherData) {
  const forecast = []
  const today = new Date()
  const baseTemp = currentWeatherData.main.temp

  // Enhanced weather conditions for better variety including scattered clouds
  const weatherConditions = [
    { icon: "01d", description: "Clear sky" },
    { icon: "02d", description: "Few clouds" },
    { icon: "03d", description: "Scattered clouds" }, // Enhanced scattered clouds
    { icon: "03n", description: "Scattered clouds" }, // Night scattered clouds
    { icon: "04d", description: "Broken clouds" }, // Enhanced broken clouds
    { icon: "04n", description: "Broken clouds" }, // Night broken clouds
    { icon: "09d", description: "Shower rain" },
    { icon: "10d", description: "Rain" },
    { icon: "11d", description: "Thunderstorm" },
    { icon: "13d", description: "Snow" },
    { icon: "50d", description: "Mist" },
  ]

  for (let i = 0; i < 10; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    // Generate realistic temperature variations
    const tempVariation = (Math.random() - 0.5) * 10 // ±5°C variation
    const seasonalTrend = Math.sin(i * 0.3) * 3 // Seasonal variation
    const high = Math.round(baseTemp + tempVariation + seasonalTrend + 2)
    const low = Math.round(baseTemp + tempVariation + seasonalTrend - 5)

    // Select weather condition (first day uses current weather)
    let condition
    if (i === 0) {
      condition = {
        icon: currentWeatherData.weather[0].icon,
        description: currentWeatherData.weather[0].description,
      }
    } else {
      // Increase probability of cloud conditions for better testing
      const cloudyConditions = weatherConditions.filter((c) => c.icon.includes("03") || c.icon.includes("04"))
      const allConditions = [...weatherConditions, ...cloudyConditions] // Double cloud chances
      condition = allConditions[Math.floor(Math.random() * allConditions.length)]
    }

    forecast.push({
      date: date,
      high: high,
      low: low,
      icon: condition.icon,
      description: condition.description,
      isToday: i === 0,
    })
  }

  return forecast
}

// Fetch weather data from openweathermap api with loading 
async function fetchWeatherData(city) {
  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
    )

    if (!weatherResponse.ok) {
      throw new Error("City not found")
    }

    const weatherData = await weatherResponse.json()

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`,
    )

    const forecastData = await forecastResponse.json()

    const airQualityResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&appid=${API_KEY}`,
    )

    const airQualityData = await airQualityResponse.json()

    return { weatherData, forecastData, airQualityData }
  } catch (error) {
    showError(error.message)
    return null
  }
}

// Show error message
function showError(message) {
  const existingError = document.querySelector(".error")
  if (existingError) existingError.remove()

  const errorDiv = document.createElement("div")
  errorDiv.className = "error"
  errorDiv.setAttribute("role", "alert") // For accessibility

  const messageSpan = document.createElement("span")
  messageSpan.textContent = `Error: ${message}`
  errorDiv.appendChild(messageSpan)

  const closeButton = document.createElement("button")
  closeButton.className = "error-close-btn"
  closeButton.innerHTML = "&times;" // '×' character
  closeButton.setAttribute("aria-label", "Close error message")
  closeButton.onclick = () => {
    errorDiv.remove()
  }
  errorDiv.appendChild(closeButton)

  const main = document.querySelector("main")
  main.insertBefore(errorDiv, main.firstChild)
}

// Update current weather with emoji fallback for better icon visibility
function updateCurrentWeather(data) {
  const temp = Math.round(data.main.temp)//to round a number to get rid of numbers like 29.78348763473783
  const description = data.weather[0].description
  const iconCode = data.weather[0].icon

  // Get emoji icon data for fallback
  const iconData = getWeatherIconData(iconCode, new Date().getHours())

  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })
  const city = data.name

  document.getElementById("current-temp").textContent = `${temp}°C`
  document.getElementById("current-condition").textContent = description.charAt(0).toUpperCase() + description.slice(1)

  // Use both API icon and emoji fallback
  const currentIconElement = document.getElementById("current-icon")
  currentIconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  currentIconElement.onerror = function () {
    // If API icon fails to load, replace with emoji
    this.style.display = "none"
    const emojiIcon = document.createElement("div")
    emojiIcon.className = `weather-icon ${iconData.class}`
    emojiIcon.style.cssText =
      "width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 48px; border-radius: 50%;"
    emojiIcon.innerHTML = `<span>${iconData.icon}</span>`
    this.parentNode.appendChild(emojiIcon)
  }

  document.getElementById("current-date").innerHTML = `<i class="fa fa-calendar"></i> ${date}`
  document.getElementById("current-location").innerHTML = `<i class="fa fa-map-marker"></i> ${city}`
}

// Update 10-day forecast with circular weather icons
function updateTenDayForecast(currentWeatherData) {
  const forecastContainer = document.getElementById("forecast-container")
  const tenDayData = generateTenDayForecast(currentWeatherData)

  forecastContainer.innerHTML = tenDayData
    .map((item, index) => {
      const dayName = item.date.toLocaleDateString("en-US", { weekday: "short" })
      const fullDate = item.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })

      // Use circular emoji icons for forecast with enhanced styling
      const iconData = getWeatherIconData(item.icon, 12, true) // Use forecast-specific styling
      const description = item.description

      return `
            <div class="forecast-item ${item.isToday ? "today" : ""}">
                <div class="forecast-date-info">
                    <div class="forecast-date">${item.isToday ? "Today" : dayName}</div>
                    <div class="forecast-full-date">${fullDate}</div>
                    <div class="forecast-description">${description}</div>
                </div>
                <div class="icon-wrapper">
                    <div class="weather-icon ${iconData.class}" title="${iconData.alt}">
                        <span>${iconData.icon}</span>
                    </div>
                </div>
                <div class="temp-range">
                    <div class="temp-high">${item.high}°</div>
                    <div class="temp-low">${item.low}°</div>
                </div>
            </div>
        `
    })
    .join("")
}

// Update air quality
function updateAirQuality(data) {
  const aqi = data.list[0].main.aqi
  const components = data.list[0].components
  const aqiText = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1]

  document.getElementById("aqi-status").textContent = aqiText
  document.getElementById("aqi-status").className = `air-index aqi-${aqi}`

  document.getElementById("pm25").textContent = components.pm2_5.toFixed(1)
  document.getElementById("pm10").textContent = components.pm10.toFixed(1)
  document.getElementById("so2").textContent = components.so2.toFixed(1)
  document.getElementById("co").textContent = components.co.toFixed(1)
  document.getElementById("no").textContent = components.no.toFixed(1)
  document.getElementById("no2").textContent = components.no2.toFixed(1)
  document.getElementById("nh3").textContent = components.nh3.toFixed(1)
  document.getElementById("o3").textContent = components.o3.toFixed(1)
}

// Update today's highlights
function updateTodayHighlights(data) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
  const humidity = data.main.humidity
  const pressure = data.main.pressure
  const visibility = (data.visibility / 1000).toFixed(1)
  const windSpeed = data.wind.speed.toFixed(1)
  const feelsLike = Math.round(data.main.feels_like)

  document.getElementById("sunrise-time").textContent = sunrise
  document.getElementById("sunset-time").textContent = sunset
  document.getElementById("humidityVal").textContent = `${humidity}%`
  document.getElementById("pressureVal").textContent = `${pressure}hPa`
  document.getElementById("visibilityVal").textContent = `${visibility}km`
  document.getElementById("windVal").textContent = `${windSpeed}m/s`
  document.getElementById("feelsVal").textContent = `${feelsLike}°C`
}

// Update 24-hour forecast with enhanced cloud visibility and appropriate icons
function updateHourlyForecast(data, currentWeatherData) {
  const hourlyContainer = document.getElementById("hourly-container")
  const hourLabels = generate24HourLabels()

  // Get current temperature and icon for interpolation
  const currentTemp = currentWeatherData.main.temp
  const currentIconCode = currentWeatherData.weather[0].icon

  // Create hourly forecast data with enhanced cloud conditions
  const hourlyData = []

  // Add current hour first
  const currentHour = new Date().getHours()
  const currentIconData = getWeatherIconData(currentIconCode, currentHour)

  hourlyData.push({
    time: hourLabels[currentHour],
    temp: Math.round(currentTemp),
    iconData: currentIconData,
    isCurrent: true,
  })

  // Enhanced weather conditions for hourly forecast with better cloud representation
  const hourlyWeatherConditions = [
    "01d",
    "01n", // Clear
    "02d",
    "02n", // Few clouds
    "03d",
    "03n", // Scattered clouds - Enhanced
    "04d",
    "04n", // Broken clouds - Enhanced
    "09d",
    "09n", // Shower rain
    "10d",
    "10n", // Rain
    "50d",
    "50n", // Mist
  ]

  // Add remaining hours with enhanced variety
  for (let i = 1; i < 24; i++) {
    const targetHour = (currentHour + i) % 24

    // Find the closest forecast data point or use enhanced random selection
    let iconCode
    let baseTemp = currentTemp

    if (data.list && data.list.length > 0) {
      let closestForecast = data.list[0]
      let minTimeDiff = Number.POSITIVE_INFINITY

      data.list.forEach((forecast) => {
        const forecastDate = new Date(forecast.dt * 1000)
        const forecastHour = forecastDate.getHours()
        const timeDiff = Math.abs(forecastHour - targetHour)

        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff
          closestForecast = forecast
        }
      })

      iconCode = closestForecast.weather[0].icon
      baseTemp = closestForecast.main.temp
    } else {
      // Use enhanced random selection with higher cloud probability
      const cloudConditions = ["03d", "03n", "04d", "04n"]
      const allConditions = [...hourlyWeatherConditions, ...cloudConditions] // Double cloud chances
      iconCode = allConditions[Math.floor(Math.random() * allConditions.length)]

      // Adjust for day/night
      if (targetHour >= 6 && targetHour < 20) {
        iconCode = iconCode.replace("n", "d")
      } else {
        iconCode = iconCode.replace("d", "n")
      }
    }

    // Add some temperature variation for realism
    const tempVariation = (Math.random() - 0.5) * 4 // ±2°C variation
    const adjustedTemp = baseTemp + tempVariation

    const iconData = getWeatherIconData(iconCode, targetHour)

    hourlyData.push({
      time: hourLabels[targetHour],
      temp: Math.round(adjustedTemp),
      iconData: iconData,
      isCurrent: false,
    })
  }

  // Generate HTML for all 24 hours with enhanced cloud visibility
  hourlyContainer.innerHTML = hourlyData
    .map(
      (hour, index) => `
        <div class="hourly-card ${hour.isCurrent ? "current-hour" : ""}">
            <div class="time">${hour.time}</div>
            <div class="weather-icon ${hour.iconData.class}">
                <span style="font-size: 24px;">${hour.iconData.icon}</span>
            </div>
            <div class="temperature">${hour.temp}°C</div>
        </div>
    `,
    )
    .join("")
}

// Search weather with loading
async function searchWeather() {
  const city = cityInput.value.trim()
  if (!city) {
    showError("Please enter a city name")
    return
  }

  if (isSearching || isThemeSwitching) return

  showSearchLoading()

  try {
    // Add minimum loading time for better UX
    const [data] = await Promise.all([
      fetchWeatherData(city),
      new Promise((resolve) => setTimeout(resolve, 2000)), // Minimum 1.5 seconds loading
    ])

    if (data) {
      updateCurrentWeather(data.weatherData)
      updateTenDayForecast(data.weatherData)
      updateAirQuality(data.airQualityData)
      updateTodayHighlights(data.weatherData)
      updateHourlyForecast(data.forecastData, data.weatherData)

      // Clear any existing errors
      const existingError = document.querySelector(".error")
      if (existingError) existingError.remove()

      // Clear input
      cityInput.value = ""
    }
  } catch (error) {
    showError("Failed to fetch weather data")
  } finally {
    hideSearchLoading()
  }
}

// Event listeners
searchBtn.addEventListener("click", searchWeather)
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !isSearching && !isThemeSwitching) {
    searchWeather()
  }
})
toggleBtn.addEventListener("click", toggleTheme)

// Initialize with enhanced cloud visibility
document.addEventListener("DOMContentLoaded", () => {
  loadTheme()
  // Load default city data with API key
  showSearchLoading()
  fetchWeatherData("Muzaffarabad").then((data) => {
    if (data) {
      updateCurrentWeather(data.weatherData)
      updateTenDayForecast(data.weatherData)
      updateAirQuality(data.airQualityData)
      updateTodayHighlights(data.weatherData)
      updateHourlyForecast(data.forecastData, data.weatherData)
    }
    hideSearchLoading()
  })
})
