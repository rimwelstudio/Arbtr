import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListFilter,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import {
  ALL_SUGGESTED_PRIORITIES,
  CATEGORY_DEFINITIONS,
  PriorityDefinition,
  ValueCategory,
} from '../data/priorities';

export type PrioritySortOption =
  | 'category'
  | 'alpha-asc'
  | 'alpha-desc'
  | 'selected-first'
  | 'recommended';

interface SuggestedPrioritiesDropdownProps {
  selectedPriorities: string[];
  onTogglePriority: (priorityName: string) => void;
  onClearAllPriorities?: () => void;
  onSelectMultiple?: (priorityNames: string[]) => void;
  className?: string;
}

export const SuggestedPrioritiesDropdown: React.FC<SuggestedPrioritiesDropdownProps> = ({
  selectedPriorities,
  onTogglePriority,
  onClearAllPriorities,
  onSelectMultiple,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ValueCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<PrioritySortOption>('category');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Auto focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Helper to test if a priority name is in selectedPriorities (case-insensitive)
  const isPrioritySelected = (name: string) => {
    return selectedPriorities.some((p) => p.toLowerCase() === name.toLowerCase());
  };

  // Count how many suggested priorities are currently ticked
  const selectedSuggestedCount = useMemo(() => {
    return ALL_SUGGESTED_PRIORITIES.filter((p) => isPrioritySelected(p.name)).length;
  }, [selectedPriorities]);

  // Filter and sort priorities based on user selection
  const processedPriorities = useMemo(() => {
    let list = [...ALL_SUGGESTED_PRIORITIES];

    // 1. Filter by category
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // 2. Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 3. Sort based on chosen value criteria
    list.sort((a, b) => {
      const aSelected = isPrioritySelected(a.name);
      const bSelected = isPrioritySelected(b.name);

      switch (sortBy) {
        case 'selected-first':
          if (aSelected && !bSelected) return -1;
          if (!aSelected && bSelected) return 1;
          return a.name.localeCompare(b.name);

        case 'alpha-asc':
          return a.name.localeCompare(b.name);

        case 'alpha-desc':
          return b.name.localeCompare(a.name);

        case 'category':
          // Sort by value domain first, then by recommended order within the domain
          if (a.category !== b.category) {
            const categoryOrder: ValueCategory[] = [
              'financial',
              'lifestyle',
              'career',
              'wellbeing',
              'autonomy',
              'technical',
              'strategic',
            ];
            return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
          }
          return a.recommendedOrder - b.recommendedOrder;

        case 'recommended':
        default:
          return a.recommendedOrder - b.recommendedOrder;
      }
    });

    return list;
  }, [activeCategory, searchQuery, sortBy, selectedPriorities]);

  // Bulk select all currently filtered items
  const handleSelectAllFiltered = () => {
    if (onSelectMultiple) {
      const namesToAdd = processedPriorities
        .map((p) => p.name)
        .filter((name) => !isPrioritySelected(name));
      onSelectMultiple(namesToAdd);
    } else {
      processedPriorities.forEach((p) => {
        if (!isPrioritySelected(p.name)) {
          onTogglePriority(p.name);
        }
      });
    }
  };

  // Bulk deselect all currently filtered items
  const handleDeselectAllFiltered = () => {
    processedPriorities.forEach((p) => {
      if (isPrioritySelected(p.name)) {
        onTogglePriority(p.name);
      }
    });
  };

  const areAllFilteredSelected =
    processedPriorities.length > 0 &&
    processedPriorities.every((p) => isPrioritySelected(p.name));

  const categoriesList: { id: ValueCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Values' },
    { id: 'financial', label: 'Financial' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'career', label: 'Career' },
    { id: 'wellbeing', label: 'Wellbeing' },
    { id: 'autonomy', label: 'Autonomy' },
    { id: 'technical', label: 'Technical' },
    { id: 'strategic', label: 'Strategic' },
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Dropdown Trigger Header / Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Suggested Priorities &amp; Values:
          </span>
          {selectedSuggestedCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
              <Check className="w-2.5 h-2.5" />
              {selectedSuggestedCount} ticked
            </span>
          )}
        </div>

        {/* Dropdown Trigger Button */}
        <button
          id="suggested-priorities-dropdown-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`inline-flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer select-none shadow-2xs ${
            isOpen
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 ring-2 ring-indigo-500/30'
              : selectedSuggestedCount > 0
                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-200/90 dark:border-indigo-800/70 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200/90 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-750'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <ListFilter className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span>
              {isOpen
                ? 'Close Priorities Selector'
                : selectedSuggestedCount > 0
                  ? `Choose Priorities (${selectedSuggestedCount} active)`
                  : 'Select From Suggested Priorities'}
            </span>
          </span>

          <span className="flex items-center gap-1 text-neutral-400">
            {isOpen ? (
              <ChevronUp className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" />
            )}
          </span>
        </button>
      </div>

      {/* Dropdown Panel Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="suggested-priorities-dropdown-panel"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border border-neutral-200/90 dark:border-neutral-700 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col max-h-[540px]"
          >
            {/* Popover Header with Title and Close Button */}
            <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-850/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                    Suggested Values &amp; Priorities
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Tick any options that reflect what matters most to your decision.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Close dropdown"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Bar & Sort Controls */}
            <div className="p-3 border-b border-neutral-200/70 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/50 space-y-2.5">
              {/* Row 1: Search Input & Sort Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    id="priorities-dropdown-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter priorities by name or description..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-hidden transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Sort base on values selector */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2.5 py-1 text-xs">
                  <ArrowUpDown className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                    Sort:
                  </span>
                  <select
                    id="priorities-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as PrioritySortOption)}
                    className="bg-transparent text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-hidden cursor-pointer pr-1"
                  >
                    <option value="category" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                      By Value Domain
                    </option>
                    <option value="selected-first" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                      Ticked / Selected First
                    </option>
                    <option value="alpha-asc" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                      Values (A → Z)
                    </option>
                    <option value="alpha-desc" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                      Values (Z → A)
                    </option>
                    <option value="recommended" className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
                      Recommended
                    </option>
                  </select>
                </div>
              </div>

              {/* Row 2: Category Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {categoriesList.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const count =
                    cat.id === 'all'
                      ? ALL_SUGGESTED_PRIORITIES.length
                      : ALL_SUGGESTED_PRIORITIES.filter((p) => p.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                        isActive
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-2xs font-semibold'
                          : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-750'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="ml-1 opacity-70 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Row 3: Bulk Actions & Match Info */}
              <div className="flex items-center justify-between text-[11px] pt-1 text-neutral-500 dark:text-neutral-400">
                <span>
                  Showing {processedPriorities.length} of {ALL_SUGGESTED_PRIORITIES.length} priorities
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={
                      areAllFilteredSelected ? handleDeselectAllFiltered : handleSelectAllFiltered
                    }
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors cursor-pointer"
                  >
                    {areAllFilteredSelected ? 'Deselect visible' : 'Select all visible'}
                  </button>
                  {selectedSuggestedCount > 0 && onClearAllPriorities && (
                    <>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={onClearAllPriorities}
                        className="hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer"
                      >
                        Clear all
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable List of Ticked Options */}
            <div
              role="listbox"
              aria-multiselectable="true"
              className="overflow-y-auto max-h-[320px] p-2 space-y-1 divide-y divide-neutral-100/60 dark:divide-neutral-800/60"
            >
              {processedPriorities.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
                  <p>No suggested priorities match your filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                    }}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                processedPriorities.map((item, index) => {
                  const selected = isPrioritySelected(item.name);
                  
                  // Show category section header when sorted by category and in 'all' view without active search
                  const prevItem = index > 0 ? processedPriorities[index - 1] : null;
                  const isNewCategory =
                    sortBy === 'category' &&
                    activeCategory === 'all' &&
                    !searchQuery.trim() &&
                    (!prevItem || prevItem.category !== item.category);

                  const catDef = CATEGORY_DEFINITIONS[item.category];

                  return (
                    <React.Fragment key={item.id}>
                      {isNewCategory && (
                        <div className="pt-3 pb-1.5 px-2.5 first:pt-1 border-t border-neutral-100 dark:border-neutral-800/60 first:border-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                              {catDef.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-normal">
                              {catDef.description}
                            </span>
                          </div>
                        </div>
                      )}

                      <div
                        role="option"
                        aria-selected={selected}
                        onClick={() => onTogglePriority(item.name)}
                        className={`group flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all select-none min-h-[44px] ${
                          selected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs'
                            : 'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 border border-transparent'
                        }`}
                      >
                        {/* Checkbox Tick Visual Indicator */}
                        <div className="mt-0.5 shrink-0">
                          {selected ? (
                            <div className="flex h-4 w-4 items-center justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 text-white shadow-2xs animate-in zoom-in-75 duration-100">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="flex h-4 w-4 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 group-hover:border-neutral-400 dark:group-hover:border-neutral-500 transition-colors" />
                          )}
                        </div>

                        {/* Content: Title, Category Badge, and Value Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-xs font-semibold truncate ${
                                selected
                                  ? 'text-indigo-950 dark:text-indigo-100 font-bold'
                                  : 'text-neutral-900 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                              }`}
                            >
                              {item.name}
                            </span>

                            {/* Category Badge */}
                            <span
                              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium border ${item.categoryBadgeClass.bg} ${item.categoryBadgeClass.text} ${item.categoryBadgeClass.border}`}
                            >
                              {item.categoryLabel}
                            </span>
                          </div>

                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal mt-0.5 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Footer Summary with Done Button */}
            <div className="p-3 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-850/80 flex items-center justify-between gap-2">
              <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                {selectedSuggestedCount === 0 ? (
                  <span>No suggested priorities selected</span>
                ) : (
                  <span className="text-neutral-900 dark:text-neutral-100 font-semibold">
                    {selectedSuggestedCount} priority {selectedSuggestedCount === 1 ? 'value' : 'values'} ticked
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="priorities-dropdown-done-btn"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-white transition-all shadow-2xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
