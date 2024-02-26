// @ts-check
const alarmName = "rna-standup-alarm";

/**
 * @typedef {object} ExtensionConfig
 * @property {number} hour
 * @property {number} minute
 */

/** @returns {Promise<void>} */
async function init() {
  await updateAlarm();

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    const shouldNotify = await getShouldNotify()
    if (alarm.name === alarmName && shouldNotify) {
      notifyItsStandupTime();
    }
  });
}

/** @returns {Promise<void>} */
async function updateAlarm() {
  const alarmTime = await getAlarmTime();

  chrome.storage.local.set({ nextStandupTime: alarmTime.getTime() });

  await chrome.alarms.create(alarmName, {
    periodInMinutes: 1,
  });
}

/** @returns {Promise<Date>} */
async function getAlarmTime() {
  const config = await getExtensionConfig();
  const hour = config.hour;
  const minute = config.minute;

  const now = new Date();
  let dayOffset = 0;

  if (
    now.getHours() > hour ||
    (now.getHours() === hour && now.getMinutes() >= minute)
  ) {
    dayOffset = 1;
  }

  const alarmTime = new Date();
  alarmTime.setDate(now.getDate() + dayOffset);
  alarmTime.setHours(hour, minute, 0);

  return alarmTime;
}

// TODO: Load configuration from repo
/** @returns {Promise<ExtensionConfig>} */
async function getExtensionConfig() {
  /** @type {ExtensionConfig} */
  const defaultExtensionConfig = {
    hour: 9,
    minute: 45,
  };

  return defaultExtensionConfig;
}

/** @returns {Promise<boolean>} */
async function getShouldNotify() {
  const alarmTime = await getAlarmTime()
  const now = new Date();

  if (alarmTime.getHours() === now.getHours() && alarmTime.getMinutes() === now.getMinutes()) {
    return true;
  }

  return false
}

async function notifyItsStandupTime() {
  console.log("STANDUP TIME");
  chrome.notifications.create("ramsey-network-standup", {
    title: "Ramsey Network Stand-up",
    message: "Time for Ramsey Network App Stand-up!!",
    type: "basic",
    iconUrl: "./rna.png",
  });
  chrome.tabs.create({
    url: "standup.html",
  });
}

// RUN
init();
