const getMostRecentSeenActivityBlock = () => {
  const lastVisitDate = new Date(Date.parse(localStorage.getItem('_ActivityFeedSeparator_lastVisitDate')));
  if (isNaN(lastVisitDate))
    return null;

  const pageItems = document.querySelectorAll('relative-time');
  for (const item of pageItems) {
    const itemDate = new Date(Date.parse(item.getAttribute('datetime')));

    if (lastVisitDate > itemDate)
      return item.closest('.body').parentElement;
  }

  return null;
};

const getMostRecentUnseenActivityBlock = () => {
  const lastVisitDate = new Date(Date.parse(localStorage.getItem('_ActivityFeedSeparator_lastVisitDate')));
  if (isNaN(lastVisitDate))
    return document.querySelectorAll('#dashboard .news > div')[0];

  const pageItems = document.querySelectorAll('relative-time');
  for (const item of pageItems) {
    const itemDate = new Date(Date.parse(item.getAttribute('datetime')));

    if (lastVisitDate < itemDate)
      return item.closest('.body').parentElement;
  }

  return null;
};

const insertNewActivityTextBefore = (element) => {
  const div = document.createElement('div');
  div.textContent = 'New activity ↓';
  div.style.margin = '1rem 0';
  div.style.textAlign = 'center';
  div.style.width = '100%';

  // Insert our block before the last seen activity
  element.parentNode.insertBefore(div, element);
};

const insertOldActivityTextBefore = (element) => {
  const div = document.createElement('div');
  div.textContent = 'Old activity ↓';
  div.style.margin = '1rem 0';
  div.style.textAlign = 'center';
  div.style.width = '100%';

  const previousElementWithBottomBorder = element.previousElementSibling.querySelector('.border-bottom');
  // If this is not the first activity on the page
  if (previousElementWithBottomBorder)
    // Remove previous activity's bottom border
    previousElementWithBottomBorder.classList.remove('border-bottom');

  // Insert our block before the last seen activity
  element.parentNode.insertBefore(div, element);
};

//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//-//

const mo = new MutationObserver(mutationsList => {
  const feedLoaded = document.querySelector('#dashboard > .news > .js-dashboard-deferred') == null;
  if (!feedLoaded)
    return;

  mo.disconnect();

  const mostRecentSeenActivityElement = getMostRecentSeenActivityBlock();
  if (mostRecentSeenActivityElement)
    insertOldActivityTextBefore(mostRecentSeenActivityElement);

  const mostRecentUnseenActivityElement = getMostRecentUnseenActivityBlock();
  if (mostRecentUnseenActivityElement)
    insertNewActivityTextBefore(mostRecentUnseenActivityElement);

  // Update last visit date
  localStorage.setItem('_ActivityFeedSeparator_lastVisitDate', new Date().toISOString());
});

const feed = document.querySelector('#dashboard > .news');
mo.observe(feed, { childList: true });
