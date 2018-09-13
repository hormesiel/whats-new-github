const getFirstNotSeenActivityElement = () => {
  const lastVisitDate = new Date(Date.parse('2018-09-13T00:30:50.349Z'));
  const pageItems = document.querySelectorAll('relative-time');

  for (const item of pageItems) {
    if (item._date < lastVisitDate)
      return item.closest('.body').parentElement;
  }
};

const insertOldActivityBlockAfter = (element) => {
  const div = document.createElement('div');
  div.textContent = 'Old activity ↓';
  div.style.margin = '1rem 0';
  div.style.textAlign = 'center';
  div.style.width = '100%';

  // Insert our block BEFORE the NEXT element, which is after the one we've selected
  element.parentNode.insertBefore(div, element.nextSibling);
  // Remove previous element's bottom border
  element.querySelector('.d-flex').classList.remove('border-bottom');
};

const firstNotSeenActivityElement = getFirstNotSeenActivityElement();
insertOldActivityBlockAfter(firstNotSeenActivityElement);
