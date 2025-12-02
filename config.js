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

const colors = {
    veryLow: "#f37c7cff",
    low: "#f4bd32ff",
    good: "#a4f03aff",
    high: "#62f383ff"
};

// unified sleep options: value, label, icon, color
const sleepQualityOptions = [
  { value: "Good", label: "Good", icon: "sentiment_satisfied", color: colors.good },
  { value: "Poor", label: "Poor", icon: "sentiment_dissatisfied", color: colors.low },
  { value: "Very poor", label: "Very poor", icon: "sentiment_very_dissatisfied", color: colors.veryLow }
];

// unified energy options
const energyLevelOptions = [
  { value: "Low", label: "Low", icon: "battery_5_bar", color: colors.veryLow },
  { value: "Okay", label: "Okay", icon: "battery_6_bar", color: colors.low },
  { value: "Good", label: "Good", icon: "battery_full", color: colors.good },
  { value: "High", label: "High", icon: "bolt", color: colors.high }
];

// unified wake time options
const wakeTimeOptions = [
  { value: "Before 7:00", label: "Before 7:00", icon: "schedule", color: colors.low },
  { value: "7:00 - 8:00", label: "7:00 - 8:00", icon: "schedule", color: colors.good },
  { value: "8:00 - 9:00", label: "8:00 - 9:00", icon: "schedule", color: colors.low },
  { value: "After 9:00", label: "After 9:00", icon: "schedule", color: colors.veryLow }
];

// unified wake time options
const sleepTimeOptions = [
  { value: "Before 7:00", label: "Before 7:00", icon: "schedule", color: colors.low },
  { value: "7:00 - 8:00", label: "7:00 - 8:00", icon: "schedule", color: colors.good },
  { value: "8:00 - 9:00", label: "8:00 - 9:00", icon: "schedule", color: colors.low },
  { value: "After 9:00", label: "After 9:00", icon: "schedule", color: colors.veryLow }
];

