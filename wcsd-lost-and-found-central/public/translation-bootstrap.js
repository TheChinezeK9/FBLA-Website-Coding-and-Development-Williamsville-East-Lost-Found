(function () {
  var languageCode = localStorage.getItem('wcsd_language_code') || 'en';
  document.documentElement.lang = languageCode;

  if (languageCode === 'en') return;

  var ATTRIBUTES_TO_TRANSLATE = ['placeholder', 'title', 'aria-label', 'alt'];
  var cache = new Map();
  var trackedTextNodes = new Set();
  var textOriginals = new WeakMap();
  var trackedElements = new Set();
  var attrOriginals = new WeakMap();
  var applying = false;

  function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function looksTranslatable(value) {
    var text = normalizeText(value || '');
    if (!text || text.length > 500) return false;
    if (/^[\d\s.,:/\\|()[\]{}\-–—+_*#%$!?&'"`~<>]+$/.test(text)) return false;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return false;
    if (/^(https?:\/\/|www\.)/i.test(text)) return false;
    return true;
  }

  function shouldSkipElement(element) {
    if (!element) return true;
    return !!element.closest('[data-no-translate], script, style, noscript, code, pre, textarea, [contenteditable="true"]');
  }

  function chunk(items, size) {
    var result = [];
    for (var i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
    return result;
  }

  function restoreOriginals() {
    trackedTextNodes.forEach(function (node) {
      var original = textOriginals.get(node);
      if (typeof original === 'string' && node.textContent !== original) {
        node.textContent = original;
      }
    });

    trackedElements.forEach(function (element) {
      var stored = attrOriginals.get(element);
      if (!stored) return;
      stored.forEach(function (originalValue, attribute) {
        if (element.getAttribute(attribute) !== originalValue) {
          element.setAttribute(attribute, originalValue);
        }
      });
    });
  }

  function collectTextNodes() {
    var nodes = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent || shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
        if (!looksTranslatable(node.textContent || '')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var current = walker.nextNode();
    while (current) {
      trackedTextNodes.add(current);
      if (!textOriginals.has(current)) {
        textOriginals.set(current, current.textContent || '');
      }
      nodes.push(current);
      current = walker.nextNode();
    }
    return nodes;
  }

  function collectAttributeEntries() {
    var entries = [];
    document.querySelectorAll('*').forEach(function (element) {
      if (shouldSkipElement(element)) return;
      ATTRIBUTES_TO_TRANSLATE.forEach(function (attribute) {
        var value = element.getAttribute(attribute);
        if (!value || !looksTranslatable(value)) return;
        trackedElements.add(element);
        var stored = attrOriginals.get(element);
        if (!stored) {
          stored = new Map();
          attrOriginals.set(element, stored);
        }
        if (!stored.has(attribute)) {
          stored.set(attribute, value);
        }
        entries.push({ element: element, attribute: attribute, original: stored.get(attribute) });
      });
    });
    return entries;
  }

  async function requestTranslations(texts) {
    var missing = texts.filter(function (text) {
      return !cache.has(languageCode + '::' + text);
    });
    if (missing.length === 0) return;

    for (var _i = 0, _arr = chunk(missing, 96); _i < _arr.length; _i++) {
      var group = _arr[_i];
      var response = await fetch('/api/translation/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: languageCode, source: 'en', texts: group })
      });
      var data = await response.json().catch(function () { return null; });
      if (!response.ok || !Array.isArray(data && data.translations)) {
        throw new Error((data && data.error) || 'Could not translate this page yet.');
      }
      group.forEach(function (text, index) {
        cache.set(languageCode + '::' + text, String(data.translations[index] || text));
      });
    }
  }

  async function applyTranslations() {
    if (applying) return;
    applying = true;
    try {
      restoreOriginals();
      var textNodes = collectTextNodes();
      var attributeEntries = collectAttributeEntries();
      var uniqueTexts = Array.from(new Set(
        textNodes.map(function (node) { return textOriginals.get(node) || ''; })
          .concat(attributeEntries.map(function (entry) { return entry.original; }))
          .filter(looksTranslatable)
      ));

      await requestTranslations(uniqueTexts);

      textNodes.forEach(function (node) {
        var original = textOriginals.get(node) || '';
        var translated = cache.get(languageCode + '::' + original);
        if (translated && node.textContent !== translated) {
          node.textContent = translated;
        }
      });

      attributeEntries.forEach(function (entry) {
        var translated = cache.get(languageCode + '::' + entry.original);
        if (translated && entry.element.getAttribute(entry.attribute) !== translated) {
          entry.element.setAttribute(entry.attribute, translated);
        }
      });
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      applying = false;
    }
  }

  var timer = null;
  var observer = new MutationObserver(function () {
    if (applying) return;
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      void applyTranslations();
    }, 80);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTES_TO_TRANSLATE
  });

  void applyTranslations();
})();
