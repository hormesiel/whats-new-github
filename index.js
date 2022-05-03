//
// VARIABLES
//

const STORAGE_KEY_LAST_VISIT_DATE = 'whats-new-github.last-visit-date';

let syncStorageValues;

//
// FUNCTIONS
//

function addLabelBeforeElement(text, element) {
  const labelElement = createLabelElement(text);

  // Insert the element in the page
  element.parentNode.insertBefore(labelElement, element);

  // Remove the previous element's bottom order if needed (not needed if there's no element before the label)
  const previousElement = labelElement.previousElementSibling;
  if (previousElement)
    previousElement.querySelector('.border-bottom').classList.remove('border-bottom');

  // Increase top margin if label is at the top of the feed
  else
    labelElement.style.marginTop = '2rem';
}

function addLabelsToFeed(feedElementParent) {
  const feedElement = getFeedElementFromParent(feedElementParent);
  const lastVisitDate = getLastVisitDate();

  addNewLabelToFeed(feedElement, lastVisitDate);
  addOldLabelToFeed(feedElement, lastVisitDate);
}

function addNewLabelToFeed(feedElement, lastVisitDate) {
  const mostRecentUnseenActivityElement = getMostRecentUnseenActivityBlock(feedElement, lastVisitDate);

  if (mostRecentUnseenActivityElement)
    addLabelBeforeElement('New &nbsp;↓', mostRecentUnseenActivityElement);
}

function addOldLabelToFeed(feedElement, lastVisitDate) {
  const mostRecentSeenActivityElement = getMostRecentSeenActivityBlock(feedElement, lastVisitDate);

  if (mostRecentSeenActivityElement)
    addLabelBeforeElement('Old &nbsp;↓', mostRecentSeenActivityElement);
}

function createLabelElement(text) {
  const div = document.createElement('div');
  div.innerHTML = text;

  /* Using GitHub classes to ensure UI consistency. Sets :
  - background
  - border
  - border-radius
  - color */
  div.classList.add('Box', 'text-gray');

  div.setAttribute('style', `
    box-shadow: 0 3px 5px #00000011;
    font-size: 0.8rem;
    margin: 1rem auto;
    padding: 0.4rem 1rem;
    position: sticky;
    text-align: center;
    text-transform: uppercase;
    top: 2rem;
    width: 5rem;
  `);

  return div;
}

function dashboardHasTabs() {
  return document.querySelector('#dashboard tab-container') != null;
}

function getFeedElementFromParent(feedElementParent) {
  return feedElementParent.querySelector('div[data-repository-hovercards-enabled]');
}

function getLastVisitDate() {
  // Allow to return a predefined value from the local storage, for test purposes
  const localStorageValue = localStorage.getItem(STORAGE_KEY_LAST_VISIT_DATE);
  if (localStorageValue)
    return new Date(localStorageValue);

  // Otherwise return the real value
  return new Date(syncStorageValues[STORAGE_KEY_LAST_VISIT_DATE]);
}

function getMostRecentSeenActivityBlock(feedElement, lastVisitDate) {
  // If user has never visited this feed, then no element to return
  if (isNaN(lastVisitDate))
    return null;

  // Get all `relative-time` elements that are children of our feed element
  const feedChildrenRelativeTimes = feedElement.querySelectorAll('relative-time');

  // Find the first element showing an activity that happened before the user's last visit
  for (const relativeTimeElement of feedChildrenRelativeTimes) {
    const datetimeAttr = relativeTimeElement.getAttribute('datetime');
    const itemDate = new Date(datetimeAttr);

    if (itemDate < lastVisitDate)
      return relativeTimeElement.closest('.body').parentElement;
  }

  // If the element was not found, which means that it's older than all the activities shown on the page
  return null;
}

function getMostRecentUnseenActivityBlock(feedElement, lastVisitDate) {
  // If user has never visited this feed, then no element to return
  if (isNaN(lastVisitDate))
    return null;

  // Get all `relative-time` elements that are children of our feed element
  const feedChildrenRelativeTimes = feedElement.querySelectorAll('relative-time');

  // Find the first element showing an activity that happened after the user's last visit
  for (const relativeTimeElement of feedChildrenRelativeTimes) {
    const datetimeAttr = relativeTimeElement.getAttribute('datetime');
    const itemDate = new Date(datetimeAttr);

    if (itemDate > lastVisitDate)
      return relativeTimeElement.closest('.body').parentElement;
  }

  // If no element was found, it means that all shown activities are older than the user's last visit
  return null;
}

function getFeedElementParent() {
  return document.querySelector('#panel-1');
}

function loadSyncStorageValues(callback) {
  return chrome.storage.sync.get(null, callback);
}

function updateLastVisitDate() {
  const map = {};
  map[STORAGE_KEY_LAST_VISIT_DATE] = new Date().toISOString();

  chrome.storage.sync.set(map);
}

function whenFeedHasBeenLoaded(feedElementParent, callback) {
  const mutationObserver = new MutationObserver((mutationsList, mutationObserver) => {
    callback(feedElementParent);
    mutationObserver.disconnect();
  });

  mutationObserver.observe(feedElementParent, { childList: true });
}

//
// INIT
//

loadSyncStorageValues(values => {
  syncStorageValues = values;
  whenFeedHasBeenLoaded(getFeedElementParent(), addLabelsToFeed);
  updateLastVisitDate();
});
