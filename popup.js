async function setStartupTime() {
  const { nextStandupTime } = await chrome.storage.local.get('nextStandupTime')
  const standupEl = document.querySelector('#stand-up-time')
  standupEl.textContent += nextStandupTime
}

setStartupTime()
