//
// VARIABLES
//

const FEED_TYPE_1 = 1; // User's 'Following' feed & organizations feeds
const FEED_TYPE_2 = 2; // User's 'For you' feed
const ORGS_DASHBOARD_REGEXP = new RegExp('/orgs/(.*)/dashboard');

let storageKeyLastVisitDate;
let syncStorageValues;

//
// FUNCTIONS
//

function addLabelBeforeElement(text, element, feedType) {
  const labelElement = createLabelElement(text, feedType);

  // Insert the element in the page
  element.parentNode.insertBefore(labelElement, element);

  // Increase top margin if label is at the top of the feed
  const previousElement = labelElement.previousElementSibling;
  if (!previousElement) {
    labelElement.style.marginTop = '2rem';
  }
}

function addLabelsToFeed(feedElementParent, feedType, feedId) {
  const feedElement = getFeedElementFromItsParent(feedElementParent);
  const lastVisitDate = getLastVisitDate(feedId);

  if (feedType === FEED_TYPE_1) {
    addNewLabelToFeedType1(feedElement, lastVisitDate);
    addOldLabelToFeedType1(feedElement, lastVisitDate);
  } else {
    addNewLabelsToFeedType2(feedElement, lastVisitDate);
  }
}

function addLabelsToFeedAndUpdateLastVisitDate(feedElementParent, feedType) {
  const feedId = getFeedId(location.pathname, feedType);

  addLabelsToFeed(feedElementParent, feedType, feedId);
  updateLastVisitDate(feedId);
}

function addNewLabelsToFeedType2(feedElement, lastVisitDate) {
  // If the user has never visited this feed, then do nothing
  if (isNaN(lastVisitDate))
    return null;

  // Get the dates and times of all the events in the feed
  const datetimeElementsSelector = getFeedEventsDatetimeElementsSelector(FEED_TYPE_2);
  const feedEventsDatetimeElements = feedElement.querySelectorAll(datetimeElementsSelector);

  // Add a 'NEW' label to all events that happened after the user's last visit
  for (const datetimeElement of feedEventsDatetimeElements) {
    const datetimeAttr = datetimeElement.getAttribute('datetime');
    const date = new Date(datetimeAttr);

    if (date > lastVisitDate)
      addNewLabelToFeedType2Event(datetimeElement);
  }
}

function addNewLabelToFeedType1(feedElement, lastVisitDate) {
  const mostRecentUnseenEventElement = getMostRecentUnseenEventBlock(feedElement, lastVisitDate, FEED_TYPE_1);

  if (mostRecentUnseenEventElement)
    addLabelBeforeElement('New &nbsp;↓', mostRecentUnseenEventElement, FEED_TYPE_1);
}

function addNewLabelToFeedType2Event(timeAgoElement) {
  const labelElement = createLabelElement('NEW', FEED_TYPE_2);

  // Insert the element in the page
  timeAgoElement.parentNode.appendChild(labelElement);
}

function addOldLabelToFeedType1(feedElement, lastVisitDate) {
  const mostRecentSeenEventElement = getMostRecentSeenEventBlock(feedElement, lastVisitDate, FEED_TYPE_1);

  if (mostRecentSeenEventElement) {
    addLabelBeforeElement('Old &nbsp;↓', mostRecentSeenEventElement, FEED_TYPE_1);
  } else {
    // Try again to add this label after more events have been loaded by the user
    const mutationObserver = new MutationObserver((mutationsList, mutationObserver) => {
      mutationObserver.disconnect();

      // When more events are loaded, GitHub loads them in a child <div>, so we need to try to add the label to this
      // child <div> and not the current one because nothing will be added to it anymore
      const childFeedElement = getFeedElementFromItsParent(feedElement);
      addOldLabelToFeedType1(childFeedElement, lastVisitDate);
    });

    mutationObserver.observe(feedElement, { childList: true });
  }
}

function computeLastVisitDateStorageKey(feedId) {
  return 'whats-new-github.last-visit-date.' + feedId;
}

function createLabelElement(text, feedType) {
  const div = document.createElement('div');
  div.innerHTML = text;

  if (feedType === FEED_TYPE_1) {

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
      z-index: 1;
    `);

    // Setting `z-index` fixes the labels being displayed below the code snippets some events contain

    return div;
  } else {
    div.setAttribute('style', `
      background-color: #1168e3; /* === GitHub's '--color-ansi-blue-bright' */
      border-radius: 1rem;
      color: white;
      font-variant: all-small-caps;
      margin-left: 0.5rem;
      padding: 0 0.5rem;
    `);
  }

  return div;
}

function getEventElementFromItsDatetimeElement(datetimeElement, feedType) {
  if (feedType === FEED_TYPE_1)
    return datetimeElement.closest('.body').parentElement;
  else
    return datetimeElement.closest('article');
}

function getFeedElementFromItsParent(feedElementParent) {
  return feedElementParent.querySelector('[data-repository-hovercards-enabled]');
}

function getFeedEventsDatetimeElementsSelector(feedType) {
  if (feedType === FEED_TYPE_1)
    return 'span > relative-time';
  else
    return 'article > header > h5 > relative-time';
}

function getFeedId(locationPathname, feedType) {
  // If the user is on an organization dashboard, then return an id based the organization's name
  if (isUserOnAnOrganizationDashboard()) {
    const matches = locationPathname.match(ORGS_DASHBOARD_REGEXP);

    if (matches.length < 2) {
      throw new Error("[whats-new-github] Looks like you're currently on an organization dashboard, but the extension"
        + " could not read the organization's name from the URL, so it can't know when you last visited this page."
        + " Please open an issue at https://github.com/flawyte/whats-new-github and paste your current URL in the"
        + " issue's description."
      );
    }

    const orgName = matches[1];
    return orgName;
  }

  // Else (= the user is on his personal dashboard), then return a constant hard-coded id
  else {
    if (feedType === FEED_TYPE_1)
      return 'user_following';
    else
      return 'user_for_you';
  }
}

function getLastVisitDate(feedId) {
  const storageKey = computeLastVisitDateStorageKey(feedId);

  // Allow to return a predefined value from the local storage, for test purposes
  const localStorageValue = localStorage.getItem(storageKey);
  if (localStorageValue)
    return new Date(localStorageValue);

  // Otherwise return the real value
  return new Date(syncStorageValues[storageKey]);
}

function getMostRecentSeenEventBlock(feedElement, lastVisitDate, feedType) {
  // If the user has never visited this feed, then no element to return
  if (isNaN(lastVisitDate))
    return null;

  // Get the dates and times of all the events in the feed
  const datetimeElementsSelector = getFeedEventsDatetimeElementsSelector(feedType);
  const feedEventsDatetimeElements = feedElement.querySelectorAll(datetimeElementsSelector);

  // Find the first element showing an event that happened before the user's last visit
  for (const datetimeElement of feedEventsDatetimeElements) {
    const datetimeAttr = datetimeElement.getAttribute('datetime');
    const date = new Date(datetimeAttr);

    if (date < lastVisitDate)
      return getEventElementFromItsDatetimeElement(datetimeElement, feedType);
  }

  // If the element was not found, which means that it's older than all the events shown on the page
  return null;
}

function getMostRecentUnseenEventBlock(feedElement, lastVisitDate, feedType) {
  // If the user has never visited this feed, then no element to return
  if (isNaN(lastVisitDate))
    return null;

  // Get the dates and times of all the events in the feed
  const datetimeElementsSelector = getFeedEventsDatetimeElementsSelector(feedType);
  const feedEventsDatetimeElements = feedElement.querySelectorAll(datetimeElementsSelector);

  // Find the first element showing an event that happened after the user's last visit
  for (const datetimeElement of feedEventsDatetimeElements) {
    const datetimeAttr = datetimeElement.getAttribute('datetime');
    const date = new Date(datetimeAttr);

    if (date > lastVisitDate)
      return getEventElementFromItsDatetimeElement(datetimeElement, feedType);
  }

  // If no element was found, it means that all shown events are older than the user's last visit
  return null;
}

function getOrganizationFeedElementParent() {
  return document.querySelector('#dashboard > .news');
}

function getUserFollowingFeedElementParent() {
  return document.querySelector('#panel-1');
}

function getUserForYouFeedElementParent() {
  return document.querySelector('#panel-2 [data-target="feed-container.content"]');
}

function isUserOnAnOrganizationDashboard() {
  return ORGS_DASHBOARD_REGEXP.test(location.pathname);
}

async function loadSyncStorageValues() {
  return chrome.storage.sync.get(null);
}

function updateLastVisitDate(feedId) {
  const storageKey = computeLastVisitDateStorageKey(feedId);

  const map = {};
  map[storageKey] = new Date().toISOString();

  chrome.storage.sync.set(map);
}

function whenFeedHasBeenLoaded(feedElementParent, feedType, callback) {
  const mutationObserver = new MutationObserver((mutationsList, mutationObserver) => {
    mutationObserver.disconnect();

    callback(feedElementParent, feedType);
  });

  mutationObserver.observe(feedElementParent, { childList: true });
}

//
// INIT
//

(async () => {
  syncStorageValues = await loadSyncStorageValues();

  if (isUserOnAnOrganizationDashboard()) {
    whenFeedHasBeenLoaded(getOrganizationFeedElementParent(), FEED_TYPE_1, addLabelsToFeedAndUpdateLastVisitDate);
  } else {
    whenFeedHasBeenLoaded(getUserFollowingFeedElementParent(), FEED_TYPE_1, addLabelsToFeedAndUpdateLastVisitDate);
    whenFeedHasBeenLoaded(getUserForYouFeedElementParent(), FEED_TYPE_2, addLabelsToFeedAndUpdateLastVisitDate);
  }
})();
