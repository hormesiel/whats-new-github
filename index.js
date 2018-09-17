const getMostRecentSeenActivityBlock = () => {
  const lastVisitDate = new Date(Date.parse(localStorage.getItem('_ActivityFeedSeparator_lastVisitDate')));
  if (isNaN(lastVisitDate))
    return null;

  const pageItems = document.querySelectorAll('relative-time');
  for (const item of pageItems) {
    if (lastVisitDate > item._date)
      return item.closest('.body').parentElement;
  }

  return null;
};

const getMostRecentUnseenActivityBlock = () => {
  const lastVisitDate = new Date(Date.parse(localStorage.getItem('_ActivityFeedSeparator_lastVisitDate')));
  if (isNaN(lastVisitDate))
    return null;

  const pageItems = document.querySelectorAll('relative-time');
  for (const item of pageItems) {
    if (lastVisitDate < item._date)
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

const mostRecentSeenActivityElement = getMostRecentSeenActivityBlock();
// If there's at least one seen activity in the page
if (mostRecentSeenActivityElement)
  insertOldActivityTextBefore(mostRecentSeenActivityElement);

const mostRecentUnseenActivityElement = getMostRecentUnseenActivityBlock();
// If there's at least one unseen activity in the page
if (mostRecentUnseenActivityElement)
  insertNewActivityTextBefore(mostRecentUnseenActivityElement);


// Update last visit date
localStorage.setItem('_ActivityFeedSeparator_lastVisitDate', new Date().toISOString());
