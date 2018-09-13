const getLastSeenActivityBlock = () => {
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

const insertOldActivityTextBefore = (element) => {
  const div = document.createElement('div');
  div.textContent = 'Old activity ↓';
  div.style.margin = '1rem 0';
  div.style.textAlign = 'center';
  div.style.width = '100%';

  const previousElementWithBottomBorder = element.previousElementSibling.querySelector('.d-flex');
  // If this is not the first activity on the page
  if (previousElementWithBottomBorder)
    // Remove previous activity's bottom border
    previousElementWithBottomBorder.classList.remove('border-bottom');

  // Insert our block before the last seen activity
  element.parentNode.insertBefore(div, element);
};

const lastSeenActivityElement = getLastSeenActivityBlock();

// If there's at least one activity in the page that we've already seen
if (lastSeenActivityElement)
  insertOldActivityTextBefore(lastSeenActivityElement);
// Else (if all activities are new) do nothing


// Update last visit date
localStorage.setItem('_ActivityFeedSeparator_lastVisitDate', new Date().toISOString());
