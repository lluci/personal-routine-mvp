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

// Sleep quality options (morning-only)
const sleepQualityOptions = [
  "OK",
  "Poor",
  "Very poor"
];

// Energy level options (can change during the day)
const energyLevelOptions = [
  "Very low",
  "Low",
  "Medium",
  "High"
];

const wakeTimeOptions = [
  "7:30",
  "8:00",
  "8:30",
  "9:00",
  "Later"
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

const energyColorMap = {
    "Very low": "#3c54daff",
    "Low": "#258bcfff",
    "Medium": "#23cde0ff",
    "High": "#81de1eff"
};

const wakeColorMap = {
    "7:30": "#44d834ff",
    "8:00": "#3be228ff",
    "8:30": "#dccb31ff",
    "9:00": "#e3942cff",
    "Later": "#dc2020ff"
};

const sleepColorMap = {
    "OK": "#38e424ff",
    "Poor": "#dcca29ff",
    "Very poor": "#dd2626ff"
};


