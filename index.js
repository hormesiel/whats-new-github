const buildTextBlock = (text) => {
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
};

const getMostRecentSeenActivityBlock = (lastVisitDate) => {
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

const getMostRecentUnseenActivityBlock = (lastVisitDate) => {
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
  element.parentNode.insertBefore(buildTextBlock('New &nbsp;↓'), element);
};

const insertOldActivityTextBefore = (element) => {
  // If this is not the first activity on the page
  if (element.previousElementSibling) {
    // Get the child who has the border
    const previousElementWithBottomBorder = element.previousElementSibling.querySelector('.border-bottom');

    // Remove previous activity's bottom border
    previousElementWithBottomBorder.classList.remove('border-bottom');
  }

  // Insert our block before the last seen activity
  element.parentNode.insertBefore(buildTextBlock('Old &nbsp;↓'), element);
};

//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//

chrome.storage.sync.get(['last_visit_date'], (values) => {
  // localStorage's value overrides saved value – useful for testing purpose & backward compatibility with 1.1.0
  if (localStorage.getItem('activity_feed.last_visit')) {
    values.last_visit_date = localStorage.getItem('activity_feed.last_visit');
    localStorage.removeItem('activity_feed.last_visit');
  }

  const lastVisitDate = new Date(Date.parse(values.last_visit_date));
  const feed = document.querySelector('#dashboard > .news');

  let newAdded = false;
  let oldAdded = false;

  const mo = new MutationObserver(mutationsList => {
    const feedLoaded = document.querySelector('#dashboard > .news > .js-dashboard-deferred') == null;
    if (!feedLoaded)
      return;

    if (!oldAdded) {
      const mostRecentSeenActivityElement = getMostRecentSeenActivityBlock(lastVisitDate);
      if (mostRecentSeenActivityElement) {
        insertOldActivityTextBefore(mostRecentSeenActivityElement);
        oldAdded = true;
      }
    }

    if (!newAdded) {
      const mostRecentUnseenActivityElement = getMostRecentUnseenActivityBlock(lastVisitDate);
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
  chrome.storage.sync.set({'last_visit_date': new Date().toISOString()});
});
