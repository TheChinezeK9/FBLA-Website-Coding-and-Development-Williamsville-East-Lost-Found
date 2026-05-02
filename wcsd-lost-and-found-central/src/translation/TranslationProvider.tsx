import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

type SupportedLanguage = {
  code: string;
  name: string;
};

type TranslationContextValue = {
  languageCode: string;
  setLanguageCode: (code: string) => void;
  supportedLanguages: SupportedLanguage[];
  isLoadingLanguages: boolean;
  isTranslating: boolean;
  translationError: string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

const FALLBACK_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'it', name: 'Italian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'pl', name: 'Polish' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'vi', name: 'Vietnamese' }
];

const ATTRIBUTES_TO_TRANSLATE = ['placeholder', 'title', 'aria-label', 'alt'] as const;
const BATCH_SIZE = 96;

const shouldSkipElement = (element: Element | null) => {
  if (!element) return true;
  if (
    element.closest('[data-no-translate], script, style, noscript, code, pre, textarea, [contenteditable="true"]')
  ) {
    return true;
  }

  const tagName = element.tagName.toLowerCase();
  return ['script', 'style', 'noscript'].includes(tagName);
};

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const looksTranslatable = (value: string) => {
  const text = normalizeText(value);
  if (!text) return false;
  if (text.length > 500) return false;
  if (/^[\d\s.,:/\\|()[\]{}\-–—+_*#%$!?&'"`~<>]+$/.test(text)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return false;
  if (/^(https?:\/\/|www\.)/i.test(text)) return false;
  return true;
};

const chunk = <T,>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const mutationTouchesTranslatableContent = (mutations: MutationRecord[]) => {
  return mutations.some(mutation => {
    if (mutation.type === 'attributes') {
      const target = mutation.target as Element | null;
      return !!target && !shouldSkipElement(target);
    }

    if (mutation.type === 'characterData') {
      const textNode = mutation.target as Text;
      const parentElement = textNode.parentElement;
      return !!parentElement && !shouldSkipElement(parentElement) && looksTranslatable(textNode.textContent || '');
    }

    const changedNodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
    if (changedNodes.length === 0) {
      const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
      return !!target && !shouldSkipElement(target);
    }

    return changedNodes.some(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const parentElement = textNode.parentElement;
        return !!parentElement && !shouldSkipElement(parentElement) && looksTranslatable(textNode.textContent || '');
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        if (shouldSkipElement(element)) return false;
        if (looksTranslatable(element.textContent || '')) return true;
        return ATTRIBUTES_TO_TRANSLATE.some(attribute => looksTranslatable(element.getAttribute(attribute) || ''));
      }

      return false;
    });
  });
};

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languageCode, setLanguageCode] = useState(() => localStorage.getItem('wcsd_language_code') || 'en');
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>(FALLBACK_LANGUAGES);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const textOriginalsRef = useRef(new WeakMap<Text, string>());
  const trackedTextNodesRef = useRef(new Set<Text>());
  const attributeOriginalsRef = useRef(new WeakMap<Element, Map<string, string>>());
  const trackedElementsRef = useRef(new Set<Element>());
  const translationCacheRef = useRef(new Map<string, string>());
  const applyingRef = useRef(false);

  useEffect(() => {
    localStorage.setItem('wcsd_language_code', languageCode);
    document.documentElement.lang = languageCode;
  }, [languageCode]);

  useEffect(() => {
    let cancelled = false;

    const loadLanguages = async () => {
      setIsLoadingLanguages(true);
      try {
        const response = await fetch('/api/translation/languages');
        const data = await response.json().catch(() => null);
        if (cancelled) return;
        if (response.ok && Array.isArray(data?.languages) && data.languages.length > 0) {
          const normalized = data.languages
            .map((language: any) => ({
              code: String(language.code || language.language || '').trim(),
              name: String(language.name || language.code || language.language || '').trim()
            }))
            .filter((language: SupportedLanguage) => language.code && language.name);
          if (normalized.length > 0) {
            setSupportedLanguages(normalized);
          }
        }
      } catch {
      } finally {
        if (!cancelled) setIsLoadingLanguages(false);
      }
    };

    void loadLanguages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    if (!body) return;

    const restoreOriginals = () => {
      trackedTextNodesRef.current.forEach(node => {
        const original = textOriginalsRef.current.get(node);
        if (original !== undefined && node.textContent !== original) {
          node.textContent = original;
        }
      });

      trackedElementsRef.current.forEach(element => {
        const attributeMap = attributeOriginalsRef.current.get(element);
        if (!attributeMap) return;
        attributeMap.forEach((originalValue, attribute) => {
          if (element.getAttribute(attribute) !== originalValue) {
            element.setAttribute(attribute, originalValue);
          }
        });
      });
    };

    if (languageCode === 'en') {
      applyingRef.current = true;
      restoreOriginals();
      applyingRef.current = false;
      setTranslationError('');
      setIsTranslating(false);
      return;
    }

    let cancelled = false;
    let timer: number | null = null;

    const collectTextNodes = () => {
      const nodes: Text[] = [];
      const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
          const textNode = node as Text;
          const parentElement = textNode.parentElement;
          if (!parentElement || shouldSkipElement(parentElement)) return NodeFilter.FILTER_REJECT;
          if (!looksTranslatable(textNode.textContent || '')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      let current = walker.nextNode();
      while (current) {
        const textNode = current as Text;
        nodes.push(textNode);
        trackedTextNodesRef.current.add(textNode);
        if (!textOriginalsRef.current.has(textNode)) {
          textOriginalsRef.current.set(textNode, textNode.textContent || '');
        }
        current = walker.nextNode();
      }

      return nodes;
    };

    const collectAttributeEntries = () => {
      const entries: Array<{ element: Element; attribute: string; original: string }> = [];
      const allElements = Array.from(body.querySelectorAll('*'));

      allElements.forEach(element => {
        if (shouldSkipElement(element)) return;

        for (const attribute of ATTRIBUTES_TO_TRANSLATE) {
          const value = element.getAttribute(attribute);
          if (!value || !looksTranslatable(value)) continue;

          trackedElementsRef.current.add(element);
          let attributeMap = attributeOriginalsRef.current.get(element);
          if (!attributeMap) {
            attributeMap = new Map<string, string>();
            attributeOriginalsRef.current.set(element, attributeMap);
          }
          if (!attributeMap.has(attribute)) {
            attributeMap.set(attribute, value);
          }
          entries.push({ element, attribute, original: attributeMap.get(attribute)! });
        }
      });

      return entries;
    };

    const requestTranslations = async (texts: string[]) => {
      const missing = texts.filter(text => !translationCacheRef.current.has(`${languageCode}::${text}`));
      if (missing.length === 0) return;

      for (const group of chunk(missing, BATCH_SIZE)) {
        const response = await fetch('/api/translation/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: languageCode,
            source: 'en',
            texts: group
          })
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !Array.isArray(data?.translations)) {
          throw new Error(data?.error || 'Could not translate this page yet.');
        }

        group.forEach((text, index) => {
          translationCacheRef.current.set(`${languageCode}::${text}`, String(data.translations[index] || text));
        });
      }
    };

    const applyTranslations = async () => {
      if (cancelled || applyingRef.current) return;
      applyingRef.current = true;
      setIsTranslating(true);

      try {
        restoreOriginals();

        const textNodes = collectTextNodes();
        const attributeEntries = collectAttributeEntries();
        const uniqueTexts = Array.from(new Set([
          ...textNodes.map(node => textOriginalsRef.current.get(node) || ''),
          ...attributeEntries.map(entry => entry.original)
        ].filter(looksTranslatable)));

        await requestTranslations(uniqueTexts);
        if (cancelled) return;

        textNodes.forEach(node => {
          const original = textOriginalsRef.current.get(node) || '';
          const translated = translationCacheRef.current.get(`${languageCode}::${original}`);
          if (translated && node.textContent !== translated) {
            node.textContent = translated;
          }
        });

        attributeEntries.forEach(({ element, attribute, original }) => {
          const translated = translationCacheRef.current.get(`${languageCode}::${original}`);
          if (translated && element.getAttribute(attribute) !== translated) {
            element.setAttribute(attribute, translated);
          }
        });

        setTranslationError('');
      } catch (error: any) {
        if (!cancelled) {
          setTranslationError(error?.message || 'Translation failed.');
        }
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
        }
        applyingRef.current = false;
      }
    };

    const scheduleApply = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        void applyTranslations();
      }, 80);
    };

    const observer = new MutationObserver((mutations) => {
      if (applyingRef.current) return;
      if (!mutationTouchesTranslatableContent(mutations)) return;
      scheduleApply();
    });

    observer.observe(body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES_TO_TRANSLATE]
    });

    void applyTranslations();

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [languageCode]);

  const value = useMemo(() => ({
    languageCode,
    setLanguageCode,
    supportedLanguages,
    isLoadingLanguages,
    isTranslating,
    translationError
  }), [languageCode, supportedLanguages, isLoadingLanguages, isTranslating, translationError]);

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
};

export const useTranslationSettings = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationSettings must be used inside TranslationProvider.');
  }
  return context;
};
