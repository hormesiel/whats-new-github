const lastVisitDate = new Date(Date.parse(localStorage.getItem('activity_feed.last_visit')));

const buildTextBlock = (text) => {
  const div = document.createElement('div');
  div.textContent = text;

  div.style.background = 'white';
  div.style.border = '1px solid #24292e';
  div.style.borderRadius = '14px';
  div.style.boxShadow = '0 3px #00000022';
  div.style.fontFamily = 'monospace';
  div.style.fontSize = '0.9375rem';
  div.style.margin = '1rem auto';
  div.style.padding = '0.1rem 1rem';
  div.style.textAlign = 'center';
  div.style.textTransform = 'uppercase';
  div.style.width = 'fit-content';

  return div;
};

const getMostRecentSeenActivityBlock = () => {
  if (isNaN(lastVisitDate))
    return null;

  const pageItems = document.querySelectorAll('.body relative-time');
  for (const item of pageItems) {
    const itemDate = new Date(Date.parse(item.getAttribute('datetime')));

    if (lastVisitDate > itemDate)
      return item.closest('.body').parentElement;
  }

  return null;
};

const getMostRecentUnseenActivityBlock = () => {
  if (isNaN(lastVisitDate)) {
    // Return the first activity on the page
    return document.querySelector('#dashboard .news > .js-all-activity-header ~ div');
  }

  const pageItems = document.querySelectorAll('.body relative-time');
  for (const item of pageItems) {
    const itemDate = new Date(Date.parse(item.getAttribute('datetime')));

    if (lastVisitDate < itemDate)
      return item.closest('.body').parentElement;
  }

  return null;
};

const insertNewActivityTextBefore = (element) => {
  // Insert our block before the last seen activity
  element.parentNode.insertBefore(buildTextBlock('New ↓'), element);
};

const insertOldActivityTextBefore = (element) => {
  const previousElementWithBottomBorder = element.previousElementSibling.querySelector('.border-bottom');
  // If this is not the first activity on the page
  if (previousElementWithBottomBorder)
    // Remove previous activity's bottom border
    previousElementWithBottomBorder.classList.remove('border-bottom');

  // Insert our block before the last seen activity
  element.parentNode.insertBefore(buildTextBlock('Old ↓'), element);
};

//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//

const feed = document.querySelector('#dashboard > .news');

let newAdded = false;
let oldAdded = false;

const mo = new MutationObserver(mutationsList => {
  const feedLoaded = document.querySelector('#dashboard > .news > .js-dashboard-deferred') == null;
  if (!feedLoaded)
    return;

  if (!oldAdded) {
    const mostRecentSeenActivityElement = getMostRecentSeenActivityBlock();
    if (mostRecentSeenActivityElement) {
      insertOldActivityTextBefore(mostRecentSeenActivityElement);
      oldAdded = true;
    }
  }

  if (!newAdded) {
    const mostRecentUnseenActivityElement = getMostRecentUnseenActivityBlock();
    if (mostRecentUnseenActivityElement) {
      insertNewActivityTextBefore(mostRecentUnseenActivityElement);
      newAdded = true;
    }
  }

  /* If the 'Old ↓' text has been added to the page already, 'New ↓' has inevitably been added as well so we can stop
  listening for mutation events.

  * If not and we have no last visit date, it means it's the user's first visit with this extension in which case
  there'll be no 'Old ↓' text to add because all activites are new to us, so we can stop listening too. */
  if (oldAdded || isNaN(lastVisitDate))
    mo.disconnect();
});

// Listen for initial/more activities loading to add the text blocks at the right places
mo.observe(feed, { childList: true });

// Update last visit date
localStorage.setItem('activity_feed.last_visit', new Date().toISOString());
