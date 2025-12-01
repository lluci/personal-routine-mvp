// ------ Google Sheets integration

const SHEETS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyR4weWRzWdKMQkgHX6WXz7RK_fiMUOLN2GgjKhOFAdMfO9g-7iR-2QWIgcGlSs3uWmXw/exec';


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

// Sleep quality options (morning-only)
const sleepQualityOptions = [
  "Very good",
  "OK",
  "Poor",
  "Very poor"
];

// Energy level options (can change during the day)
const energyLevelOptions = [
  "Very low",
  "Low",
  "Medium",
  "High",
  "Very high"
];

