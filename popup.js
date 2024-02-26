async function setStartupTime() {
  const { nextStandupTime } = await chrome.storage.local.get("nextStandupTime");
  const standupEl = document.querySelector("#stand-up-time");
  const next = new Date(nextStandupTime);
  const day = next.toLocaleDateString("en-US", { weekday: "short" });
  const hour = next.getHours() - Math.floor(next.getHours() / 12) * 12 || 12;
  const minute = next.getMinutes();
  const suffix = next.getHours() >= 12 ? "pm" : "am";

  const timeString = `${day}, ${hour}:${minute}${suffix}`;

  standupEl.textContent += timeString;
}

document.querySelector("#open-button").addEventListener("click", () => {
  chrome.tabs.create({
    url: "standup.html",
  });
});

setStartupTime();
