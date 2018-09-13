const getLastSeenActivityBlock = () => {
  const lastVisitDate = new Date(Date.parse('2018-09-13T00:30:50.349Z'));
  const pageItems = document.querySelectorAll('relative-time');

  for (const item of pageItems) {
    if (lastVisitDate > item._date)
      return item.closest('.body').parentElement;
  }
};

const insertOldActivityTextBefore = (element) => {
  const div = document.createElement('div');
  div.textContent = 'Old activity ↓';
  div.style.margin = '1rem 0';
  div.style.textAlign = 'center';
  div.style.width = '100%';

  // Remove previous element's bottom border
  element.previousElementSibling.querySelector('.d-flex').classList.remove('border-bottom');

  // Insert our block before the last seen activity block
  element.parentNode.insertBefore(div, element);
};

const lastSeenActivityElement = getLastSeenActivityBlock();
insertOldActivityTextBefore(lastSeenActivityElement);
