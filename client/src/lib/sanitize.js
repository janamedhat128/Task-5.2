
import DOMPurify from 'dompurify';

// Clean review HTML before rendering it in the browser.
// Allow basic formatting but remove dangerous HTML and JS.
export const sanitizeHtml = (dirty) => {
  if (typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'strong',
      'i', 'em', 'u',
      'p', 'br',
      'a',
      'ul', 'ol', 'li'
    ],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false
  });
};
