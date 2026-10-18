import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption, getTranslation } from '../utils/i18n';

interface LanguageSelectorProps {
  currentLanguage: string;
  onSelectLanguage: (code: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const t = getTranslation(currentLanguage);
  const activeOption = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="global-language-selector-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/90 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-2xs"
        title="Change application language"
      >
        <span className="text-sm">{activeOption.flag}</span>
        <span className="hidden sm:inline font-semibold text-neutral-800 dark:text-neutral-200">{activeOption.nativeName}</span>
        <span className="sm:hidden uppercase font-semibold text-[11px] text-neutral-800 dark:text-neutral-200">{activeOption.code}</span>
        <ChevronDown className={`h-3 w-3 text-neutral-400 dark:text-neutral-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="language-dropdown-menu"
          className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-neutral-900 p-2 shadow-xl border border-neutral-200/90 dark:border-neutral-800 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-2 py-1.5 mb-1 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Globe className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
              {t.appLanguage || 'App Language'}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{SUPPORTED_LANGUAGES.length} {t.languagesCount || 'languages'}</span>
          </div>

          <div className="p-1 mb-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchLanguagePlaceholder || 'Search language...'}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1 text-xs text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-neutral-900 dark:focus:border-neutral-400 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
            {filtered.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                    isSelected
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span>{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-400 dark:text-neutral-500'}`}>
                      ({lang.name})
                    </span>
                  </span>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1 text-emerald-400 dark:text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
