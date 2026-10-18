import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Plus, 
  ShieldCheck, 
  Filter, 
  Info, 
  Sparkles, 
  ThumbsUp, 
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { OptionAnalysis, ImpactLevel, ProConItem } from '../types';
import { getTranslation } from '../utils/i18n';

interface ProsConsViewProps {
  options: OptionAnalysis[];
  onUpdateOptions: (updated: OptionAnalysis[]) => void;
  currentLanguage?: string;
}

const IMPACT_COLORS: Record<ImpactLevel, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/60' },
  high: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/60' },
  medium: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/60' },
  low: { bg: 'bg-neutral-50 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-300', border: 'border-neutral-200 dark:border-neutral-700' },
};

export const ProsConsView: React.FC<ProsConsViewProps> = ({
  options,
  onUpdateOptions,
  currentLanguage,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0]?.id || '');
  const [impactFilter, setImpactFilter] = useState<'all' | 'high_critical'>('all');
  const [activeTab, setActiveTab] = useState<'both' | 'pros' | 'cons'>('both');
  const t = getTranslation(currentLanguage);
  
  // New item modal/inline state
  const [showAddForm, setShowAddForm] = useState<'pro' | 'con' | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImpact, setNewItemImpact] = useState<ImpactLevel>('medium');
  const [newItemRationale, setNewItemRationale] = useState('');
  const [newItemMitigation, setNewItemMitigation] = useState('');

  const currentOption = options.find((o) => o.id === selectedOptionId) || options[0];

  const filterItems = (items: ProConItem[]) => {
    if (impactFilter === 'high_critical') {
      return items.filter((i) => i.impact === 'critical' || i.impact === 'high');
    }
    return items;
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !showAddForm || !currentOption) return;

    const newItem: ProConItem = {
      id: 'custom_' + Date.now(),
      text: newItemText.trim(),
      category: newItemCategory.trim() || 'Custom',
      impact: newItemImpact,
      rationale: newItemRationale.trim() || undefined,
      mitigation: showAddForm === 'con' ? newItemMitigation.trim() || undefined : undefined,
      userAdded: true,
    };

    const updatedOptions = options.map((opt) => {
      if (opt.id === currentOption.id) {
        return {
          ...opt,
          pros: showAddForm === 'pro' ? [...opt.pros, newItem] : opt.pros,
          cons: showAddForm === 'con' ? [...opt.cons, newItem] : opt.cons,
        };
      }
      return opt;
    });

    onUpdateOptions(updatedOptions);
    // Reset form
    setShowAddForm(null);
    setNewItemText('');
    setNewItemCategory('');
    setNewItemRationale('');
    setNewItemMitigation('');
    setNewItemImpact('medium');
  };

  const handleDeleteItem = (isPro: boolean, itemId: string) => {
    if (!currentOption) return;
    const updatedOptions = options.map((opt) => {
      if (opt.id === currentOption.id) {
        return {
          ...opt,
          pros: isPro ? opt.pros.filter((p) => p.id !== itemId) : opt.pros,
          cons: !isPro ? opt.cons.filter((c) => c.id !== itemId) : opt.cons,
        };
      }
      return opt;
    });
    onUpdateOptions(updatedOptions);
  };

  if (!currentOption) {
    return <div className="text-center py-12 text-neutral-500">No options available to display.</div>;
  }

  const filteredPros = filterItems(currentOption.pros || []);
  const filteredCons = filterItems(currentOption.cons || []);

  return (
    <div className="space-y-6">
      {/* Option Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 dark:border-neutral-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {options.map((opt, idx) => {
            const isSelected = opt.id === currentOption.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100 shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold ${
                  isSelected ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 dark:bg-neutral-900/10 text-neutral-200 dark:text-neutral-700 font-semibold' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                }`}>
                  {opt.score || 70}/100
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1 border border-neutral-200/60 dark:border-neutral-700 text-xs">
            <button
              type="button"
              onClick={() => setImpactFilter('all')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                impactFilter === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.prosConsAll || 'All'} ({currentOption.pros.length + currentOption.cons.length})
            </button>
            <button
              type="button"
              onClick={() => setImpactFilter('high_critical')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                impactFilter === 'high_critical' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {t.prosConsMajorOnly || 'Major Impact Only'}
            </button>
          </div>
        </div>
      </div>

      {/* Option Summary Banner */}
      <div className="rounded-xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {t.prosConsAnalysisOverview || 'Analysis Overview for'} {currentOption.name}:
          </span>
          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
            {currentOption.summary}
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
            <TrendingUp className="h-3.5 w-3.5" />
            {currentOption.pros.length} {t.tabPros || 'Pros'}
          </span>
          <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-200/60 dark:border-rose-800/60">
            <AlertCircle className="h-3.5 w-3.5" />
            {currentOption.cons.length} {t.tabCons || 'Cons'}
          </span>
        </div>
      </div>

      {/* Two-Column Pros & Cons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PROS COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                {t.prosTitle || 'Pros & Advantages'}
              </h3>
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                ({filteredPros.length})
              </span>
            </div>
            
            <button
              type="button"
              onClick={() => setShowAddForm('pro')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200/60 dark:border-emerald-800/60"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.addProBtn || 'Add Pro'}
            </button>
          </div>

          <div className="space-y-3">
            {filteredPros.map((pro) => {
              const impactStyle = IMPACT_COLORS[pro.impact] || IMPACT_COLORS.medium;
              return (
                <div
                  key={pro.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {pro.category && (
                        <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                          {pro.category}
                        </span>
                      )}
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${impactStyle.bg} ${impactStyle.text} ${impactStyle.border}`}>
                        {pro.impact} {t.prosConsImpactSuffix || 'impact'}
                      </span>
                      {pro.userAdded && (
                        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                          {t.prosConsYouAdded || 'You added'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(true, pro.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 transition-opacity"
                      title="Delete item"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                    {pro.text}
                  </p>

                  {pro.rationale && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed bg-neutral-50/70 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      {pro.rationale}
                    </p>
                  )}
                </div>
              );
            })}

            {filteredPros.length === 0 && (
              <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {t.prosConsNoMatches || 'No pros match the current filter.'}
              </div>
            )}
          </div>
        </div>

        {/* CONS COLUMN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                <X className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
                {t.consTitle || 'Cons & Trade-offs'}
              </h3>
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                ({filteredCons.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm('con')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-800 dark:hover:text-rose-200 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 px-2.5 py-1 rounded-lg transition-colors border border-rose-200/60 dark:border-rose-800/60"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.addConBtn || 'Add Con'}
            </button>
          </div>

          <div className="space-y-3">
            {filteredCons.map((con) => {
              const impactStyle = IMPACT_COLORS[con.impact] || IMPACT_COLORS.medium;
              return (
                <div
                  key={con.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {con.category && (
                        <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
                          {con.category}
                        </span>
                      )}
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${impactStyle.bg} ${impactStyle.text} ${impactStyle.border}`}>
                        {con.impact} {t.prosConsImpactSuffix || 'impact'}
                      </span>
                      {con.userAdded && (
                        <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                          {t.prosConsYouAdded || 'You added'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(false, con.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-600 transition-opacity"
                      title="Delete item"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                    {con.text}
                  </p>

                  {con.rationale && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed bg-neutral-50/70 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800">
                      {con.rationale}
                    </p>
                  )}

                  {/* Mitigation Strategy */}
                  {con.mitigation && (
                    <div className="mt-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 p-2.5 flex items-start gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                          {t.mitigationStrategy || 'How to Hedge / Mitigate:'}
                        </span>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200 mt-0.5">
                          {con.mitigation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredCons.length === 0 && (
              <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
                {t.prosConsNoMatches || 'No cons match the current filter.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Custom Item Modal / Inline Drawer */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-base">
                {t.addCustomPointTitle || 'Add Custom Point to'} {currentOption.name}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.fieldPointStatement || 'Point / Statement'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder={showAddForm === 'pro' ? "e.g., Offers 4-day workweek during summer" : "e.g., Unclear health insurance deductibles"}
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.fieldCategory || 'Category'}
                  </label>
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="e.g., Lifestyle, Financial"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.fieldImpactLevel || 'Impact Level'}
                  </label>
                  <select
                    value={newItemImpact}
                    onChange={(e) => setNewItemImpact(e.target.value as ImpactLevel)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
                  >
                    <option value="critical">{t.impactCritical || 'Critical'}</option>
                    <option value="high">{t.impactHigh || 'High'}</option>
                    <option value="medium">{t.impactMedium || 'Medium'}</option>
                    <option value="low">{t.impactLow || 'Low'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t.fieldRationaleOptional || 'Rationale / Detail (Optional)'}
                </label>
                <input
                  type="text"
                  value={newItemRationale}
                  onChange={(e) => setNewItemRationale(e.target.value)}
                  placeholder="Why does this matter?"
                  className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
                />
              </div>

              {showAddForm === 'con' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t.fieldMitigationOptional || 'Mitigation / Solution (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newItemMitigation}
                    onChange={(e) => setNewItemMitigation(e.target.value)}
                    placeholder="How could you hedge or solve this?"
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(null)}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  {t.btnCancel || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                >
                  {t.btnSavePoint || 'Save Point'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
