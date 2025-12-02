// ------ Google Sheets integration

const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyplgZuKdcp8f2SuoN9ho9zJkI9A-xRKyqloyE7r4f4bDatCrHvLWksXBKYjM6u5tkn3w/exec';


// Ideal daily schedule (same every day)

const scheduleConfig = {
  morningActivation: {
    label: "Morning activation",
    idealStart: "08:00",
    reminderOffset: 30 // minutes before
  },

  morningExit: {
    label: "Leave home",
    idealStart: "09:00",
    reminderOffset: 15,
    hasMorningCheckIn: true
  },

  lunch: {
    label: "Lunch",
    idealStart: "13:00",
    reminderOffset: 15
  },

  dinner: {
    label: "Dinner",
    idealStart: "19:30",
    reminderOffset: 30
  },

  slowDown: {
    label: "Slow down",
    idealStart: "22:00",
    reminderOffset: 0,
    hasEveningCheckOut: true
  },

  sleep: {
    label: "Sleep / in bed",
    idealStart: "23:00",
    reminderOffset: 0
  }
};

// ------ Morning check-in options

// Field default background (unselected)
const SELECT_DEFAULT_BG = "#e5e7eb"; // light gray until user accepts an option

// Sleep quality options (morning-only)
const sleepQualityOptions = [
  "OK",
  "Poor",
  "Very poor"
];

// Energy level options (can change during the day)
const energyLevelOptions = [
  "Low",
  "Okay",
  "Good",
  "High"
];

const wakeTimeOptions = [
   "Before 7:00",
    "7:00 - 8:00",
    "8:00 - 9:00",
    "After 9:00"
];

const sleepIconMap = {
  "OK": "sentiment_satisfied",
  "Poor": "sentiment_dissatisfied",
  "Very poor": "sentiment_very_dissatisfied"
};

const energyIconMap = {
  "Very low": "battery_alert",
  "Low": "battery_5_bar",
  "Medium": "battery_6_bar",
  "High": "bolt"
};

const colors = {
    color_veryLow: "#9930d2ff",
    color_low: "#d44242ff",
    color_good: "#e8af1eff",
    color_high: "#92c52dff",
    color_veryHigh: "#1cd566ff"
};

const energyColorMap = {
    "Low": colors.color_veryLow,
    "Okay": colors.color_good,
    "Good": colors.color_high,
    "High": colors.color_veryHigh
};

const wakeColorMap = {
    "Before 7:00": colors.color_good,
    "7:00 - 8:00": colors.color_high,
    "8:00 - 9:00": colors.color_low,
    "After 9:00": colors.color_veryLow
};

const sleepColorMap = {
    "OK": colors.color_good,
    "Poor": colors.color_low,
    "Very poor": colors.color_veryLow
};


