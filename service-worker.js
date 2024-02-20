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

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === alarmName) {
      notifyItsStandupTime();
    }
  });
}

/** @returns {Promise<void>} */
async function updateAlarm() {
  const standupAlarm = await chrome.alarms.get(alarmName);
  const alarmTime = await getAlarmTime();
  let deleted = false;

  console.log("Alarm Time:", alarmTime);
  console.log("Alarm Already Exists:", standupAlarm != null);

  if (standupAlarm != null) {
    const oldAlarmTime = new Date(standupAlarm.scheduledTime);

    // Clear Alarm if it's the wrong time
    if (
      alarmTime.getHours() !== oldAlarmTime.getHours() ||
      alarmTime.getMinutes() !== oldAlarmTime.getMinutes()
    ) {
      console.log("Deleting old alarm");
      await chrome.alarms.clear(alarmName);
      deleted = true;
    }
  }

  if (!standupAlarm || deleted) {
    console.log("Creating new alarm");
    // check alarm again to see if it needs to be created
    await chrome.alarms.create(alarmName, {
      when: alarmTime.getTime(),
      periodInMinutes: 1440,
    });
  }
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

  return defaultExtensionConfig
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
