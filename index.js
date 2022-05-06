//
// VARIABLES
//

const ORGS_DASHBOARD_REGEXP = new RegExp('/orgs/(.*)/dashboard');

let storageKeyLastVisitDate;
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
  const mostRecentUnseenEventElement = getMostRecentUnseenEventBlock(feedElement, lastVisitDate);

  if (mostRecentUnseenEventElement)
    addLabelBeforeElement('New &nbsp;↓', mostRecentUnseenEventElement);
}

function addOldLabelToFeed(feedElement, lastVisitDate) {
  const mostRecentSeenEventElement = getMostRecentSeenEventBlock(feedElement, lastVisitDate);

  if (mostRecentSeenEventElement) {
    addLabelBeforeElement('Old &nbsp;↓', mostRecentSeenEventElement);
  } else {
    // Try again to add this label after more events have been loaded by the user
    const mutationObserver = new MutationObserver((mutationsList, mutationObserver) => {
      mutationObserver.disconnect();

      // When more events are loaded, GitHub loads them in a child <div>, so we need to try to add the label to this
      // child <div> and not the current one because nothing will be added to it anymore
      const childFeedElement = feedElement.querySelector('div[data-repository-hovercards-enabled]');
      addOldLabelToFeed(childFeedElement, lastVisitDate);
    });

    mutationObserver.observe(feedElement, { childList: true });
  }
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
    z-index: 1;
  `);

  // Setting `z-index` fixes the labels being displayed below the code snippets some events contain

  return div;
}

function dashboardHasTabs() {
  return document.querySelector('#dashboard tab-container') != null;
}

function getFeedElementFromParent(feedElementParent) {
  return feedElementParent.querySelector('div[data-repository-hovercards-enabled]');
}

function getFeedId() {
  const { pathname } = location;

  if (pathname === '/' || pathname === '/dashboard') {
    // If the user is on his dashboard, then return a constant hard-coded id
    return 'user_following';
  } else if (ORGS_DASHBOARD_REGEXP.test(pathname)) {
    // Else, if the user is on an organization's dashboard, then return an id based the organization's name
    const matches = pathname.match(ORGS_DASHBOARD_REGEXP);

    if (matches.length < 2) {
      throw new Error("[whats-new-github] Looks like you're currently on an organization's dashboard, but the extension"
        + " could not read the organization's name from the URL, so it can't know when you last visited this page."
        + " Please open an issue at https://github.com/flawyte/whats-new-github and paste your current URL in the"
        + " issue's description."
      );
    }

    const orgName = matches[1];
    return orgName;
  } else {
    throw new Error("[whats-new-github] Looks like you're currently on a GitHub page that is not yet supported by the"
      + " extension. Please open an issue at https://github.com/flawyte/whats-new-github and paste your current URL"
      + " in the issue's description."
    );
  }
}

function getLastVisitDate() {
  // Allow to return a predefined value from the local storage, for test purposes
  const localStorageValue = localStorage.getItem(storageKeyLastVisitDate);
  if (localStorageValue)
    return new Date(localStorageValue);

  // Otherwise return the real value
  return new Date(syncStorageValues[storageKeyLastVisitDate]);
}

function getMostRecentSeenEventBlock(feedElement, lastVisitDate) {
  // If user has never visited this feed, then no element to return
  if (isNaN(lastVisitDate))
    return null;

  // Get all of our feed's events' <relative-time> elements
  const feedChildrenRelativeTimes = feedElement.querySelectorAll('span > relative-time');

  // Note: Some events are sometimes grouped together and folded, and an 'Unfold' button allows the user to unfold the
  // group so he can see the whole list. These event groups can contain nested <relative-time> elements, one in each
  // list item, which we're not interested in since we only want the dates and times of the events that are direct
  // children of the feed, not of the nested ones. These dates and times are always direct children of a <span> element.

  // Find the first element showing an event that happened before the user's last visit
  for (const relativeTimeElement of feedChildrenRelativeTimes) {
    const datetimeAttr = relativeTimeElement.getAttribute('datetime');
    const itemDate = new Date(datetimeAttr);

    if (itemDate < lastVisitDate)
      return relativeTimeElement.closest('.body').parentElement;
  }

  // If the element was not found, which means that it's older than all the events shown on the page
  return null;
}

function getMostRecentUnseenEventBlock(feedElement, lastVisitDate) {
  // If user has never visited this feed, then no element to return
  if (isNaN(lastVisitDate))
    return null;

  // Get all of our feed's events' <relative-time> elements
  const feedChildrenRelativeTimes = feedElement.querySelectorAll('span > relative-time');

  // Note: Some events are sometimes grouped together and folded, and an 'Unfold' button allows the user to unfold the
  // group so he can see the whole list. These event groups can contain nested <relative-time> elements, one in each
  // list item, which we're not interested in since we only want the dates and times of the events that are direct
  // children of the feed, not of the nested ones. These dates and times are always direct children of a <span> element.

  // Find the first element showing an event that happened after the user's last visit
  for (const relativeTimeElement of feedChildrenRelativeTimes) {
    const datetimeAttr = relativeTimeElement.getAttribute('datetime');
    const itemDate = new Date(datetimeAttr);

    if (itemDate > lastVisitDate)
      return relativeTimeElement.closest('.body').parentElement;
  }

  // If no element was found, it means that all shown events are older than the user's last visit
  return null;
}

function getFeedElementParent() {
  if (isUserOnAnOrganizationDashboard())
    return document.querySelector('#dashboard > .news');
  else
    return document.querySelector('#panel-1');
}

function isUserOnAnOrganizationDashboard() {
  return ORGS_DASHBOARD_REGEXP.test(location.pathname);
}

function loadSyncStorageValues(callback) {
  return chrome.storage.sync.get(null, callback);
}

function updateLastVisitDate() {
  const map = {};
  map[storageKeyLastVisitDate] = new Date().toISOString();

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

storageKeyLastVisitDate = 'whats-new-github.last-visit-date.' + getFeedId();

loadSyncStorageValues(values => {
  syncStorageValues = values;
  whenFeedHasBeenLoaded(getFeedElementParent(), addLabelsToFeed);
  updateLastVisitDate();
});
