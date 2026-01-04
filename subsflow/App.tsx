
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  MoreVertical, 
  DollarSign,
  TrendingUp,
  Info,
  X,
  Moon,
  Sun,
  Menu,
  Sparkles,
  PenLine,
  ChevronRight,
  Download,
  Upload,
  CheckCircle2,
  Save,
  Copy,
  Smartphone,
  ArrowUpDown,
  Tag,
  Briefcase,
  Gamepad2,
  Home,
  Zap,
  LayoutGrid,
  GripVertical,
  List,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Flow, Subscription, BillingCycle, UserSettings, SortField, SortDirection } from './types';
import { trigramSimilarity } from './utils/search';

// --- Constants & Data ---

const TRANSLATIONS = {
  en: {
    library: 'YOUR LIBRARY',
    totalMonthly: 'Monthly',
    totalYearly: 'Yearly',
    subscriptions: 'Subscriptions',
    addEntry: 'Add Entry',
    startPrompt: 'Start by adding your first subscription',
    searchPlaceholder: 'Search for inspiration...',
    noFlows: 'No flows found',
    settings: 'Preferences',
    selectFlowDesc: 'Select an existing flow or create a new one.',
    createFlow: 'New',
    newFlowTitle: 'New Idea Flow',
    untitled: 'Untitled Flow',
    currency: 'Currency',
    theme: 'Theme',
    language: 'Language',
    delete: 'Delete',
    monthly: 'Monthly',
    yearly: 'Yearly',
    serviceName: 'Service Name',
    descriptionPlaceholder: 'Add a note...',
    emptyTitle: 'The Void — Beginning of All',
    emptySubtitle: 'Create your first flow right now',
    data: 'Data Management',
    export: 'Export Backup',
    import: 'Import Backup',
    saved: 'Saved',
    saving: 'Saving...',
    sync: 'Cross-Device Sync',
    copyToken: 'Copy Sync Token',
    pasteToken: 'Paste Token',
    tokenCopied: 'Copied!',
    loadToken: 'Load Data',
    invalidToken: 'Invalid Token',
    sort: 'Sort',
    category: 'Category',
    categoryPlaceholder: 'No Category',
    manual: 'Manual'
  },
  ru: {
    library: 'ВАША БИБЛИОТЕКА',
    totalMonthly: 'В месяц',
    totalYearly: 'В год',
    subscriptions: 'Подписки',
    addEntry: 'Добавить',
    startPrompt: 'Добавьте вашу первую подписку',
    searchPlaceholder: 'Поиск вдохновения...',
    noFlows: 'Ничего не найдено',
    settings: 'Настройки',
    selectFlowDesc: 'Выберите существующий список или создайте новый.',
    createFlow: 'Новая',
    newFlowTitle: 'Новый список идей',
    untitled: 'Без названия',
    currency: 'Валюта',
    theme: 'Тема',
    language: 'Язык',
    delete: 'Удалить',
    monthly: 'Ежемесячно',
    yearly: 'Ежегодно',
    serviceName: 'Название сервиса',
    descriptionPlaceholder: 'Заметка...',
    emptyTitle: 'Пустота — начало всего',
    emptySubtitle: 'Создайте первую идею прямо сейчас',
    data: 'Управление данными',
    export: 'Скачать резервную копию',
    import: 'Загрузить копию',
    saved: 'Сохранено',
    saving: 'Сохранение...',
    sync: 'Синхронизация',
    copyToken: 'Скопировать код',
    pasteToken: 'Вставить код',
    tokenCopied: 'Скопировано!',
    loadToken: 'Загрузить',
    invalidToken: 'Неверный код',
    sort: 'Сортировка',
    category: 'Категория',
    categoryPlaceholder: 'Без категории',
    manual: 'Вручную'
  }
};

const DEFAULT_FLOWS: Flow[] = [
  {
    id: '1',
    title: 'Work & Productivity',
    updatedAt: Date.now(),
    subscriptions: [
      { id: 's1', name: 'GitHub Copilot', description: 'AI Coding Assistant', price: 10, billingCycle: BillingCycle.MONTHLY, category: 'Dev' },
      { id: 's2', name: 'Claude Pro', description: 'Advanced AI models', price: 20, billingCycle: BillingCycle.MONTHLY, category: 'AI' },
    ]
  },
  {
    id: '2',
    title: 'Entertainment',
    updatedAt: Date.now() - 86400000,
    subscriptions: [
      { id: 'e1', name: 'Netflix', description: 'Movies and TV', price: 15.49, billingCycle: BillingCycle.MONTHLY, category: 'Fun' },
    ]
  }
];

// --- Helpers ---

const getCategoryColor = (category: string) => {
  if (!category) return 'text-zinc-500';
  const colors = [
    'text-blue-400', 'text-purple-400', 'text-emerald-400', 
    'text-yellow-400', 'text-pink-400', 'text-indigo-400', 
    'text-cyan-400', 'text-rose-400', 'text-orange-400'
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// --- Components ---

const CustomSelect = ({ value, onChange, options, icon: Icon }: { value: string, onChange: (v: string) => void, options: { label: string, value: string, icon?: any }[], icon?: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="gpu text-[10px] uppercase tracking-wider font-bold bg-white/5 text-zinc-400 px-3 py-1.5 rounded-lg hover:bg-white/10 theme-transition flex items-center gap-2 min-w-[90px] justify-between active:scale-95 border border-white/5"
      >
        <span className="flex items-center gap-2">
           {Icon && <Icon size={12} />}
           {selectedOption?.label}
        </span>
        <MoreVertical size={10} className="opacity-50" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-32 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-pop origin-top-right">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-white/5 theme-transition flex items-center gap-2 ${value === opt.value ? 'text-white' : 'text-zinc-500'}`}
            >
              {opt.icon && <opt.icon size={12} />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  // State
  const [flows, setFlows] = useState<Flow[]>(() => {
    const saved = localStorage.getItem('subsflow_data');
    return saved ? JSON.parse(saved) : DEFAULT_FLOWS;
  });
  const [activeFlowId, setActiveFlowId] = useState<string | null>(flows[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [syncInput, setSyncInput] = useState('');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('manual');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('subsflow_settings');
    return saved ? JSON.parse(saved) : {
      currency: '$',
      theme: 'dark', 
      language: 'ru', 
      compactMode: false
    };
  });

  // Effects
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('subsflow_data', JSON.stringify(flows));
      setSaveStatus('saved');
    }, 800);
    return () => clearTimeout(timer);
  }, [flows]);

  useEffect(() => {
    localStorage.setItem('subsflow_settings', JSON.stringify(settings));
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(settings.theme);
    
    // Set meta theme color based on theme
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', settings.theme === 'dark' ? '#050505' : '#f9f9f8');
    }
  }, [settings]);

  // Derived State
  const t = TRANSLATIONS[settings.language];
  
  const activeFlow = useMemo(() => 
    flows.find(f => f.id === activeFlowId), 
    [flows, activeFlowId]
  );

  const filteredFlows = useMemo(() => {
    if (!searchQuery) return flows.sort((a, b) => b.updatedAt - a.updatedAt);
    return flows
      .map(flow => ({ flow, score: trigramSimilarity(searchQuery, flow.title) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.flow);
  }, [flows, searchQuery]);

  // Sorted Subscriptions
  const sortedSubscriptions = useMemo(() => {
    if (!activeFlow) return [];
    
    // If manual, just return the list as is (user controlled order)
    if (sortField === 'manual') {
      return activeFlow.subscriptions;
    }

    return [...activeFlow.subscriptions].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'price') {
        comparison = (a.price || 0) - (b.price || 0);
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'category') {
        comparison = (a.category || '').localeCompare(b.category || '');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [activeFlow, sortField, sortDirection]);

  const totals = useMemo(() => {
    if (!activeFlow) return { monthly: 0, yearly: 0 };
    return activeFlow.subscriptions.reduce((acc, sub) => {
      const price = Number(sub.price) || 0;
      if (sub.billingCycle === BillingCycle.MONTHLY) {
        acc.monthly += price;
        acc.yearly += price * 12;
      } else {
        acc.monthly += price / 12;
        acc.yearly += price;
      }
      return acc;
    }, { monthly: 0, yearly: 0 });
  }, [activeFlow]);

  const handleCreateFlow = () => {
    const newFlow: Flow = {
      id: Math.random().toString(36).substr(2, 9),
      title: t.newFlowTitle,
      updatedAt: Date.now(),
      subscriptions: []
    };
    setFlows([newFlow, ...flows]);
    setActiveFlowId(newFlow.id);
    setIsMobileMenuOpen(false); 
  };

  const handleUpdateSubscription = (flowId: string, subId: string, updates: Partial<Subscription>) => {
    setFlows(prev => prev.map(f => {
      if (f.id !== flowId) return f;
      return {
        ...f,
        updatedAt: Date.now(),
        subscriptions: f.subscriptions.map(s => s.id === subId ? { ...s, ...updates } : s)
      };
    }));
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (field === 'manual') return; // Manual has no direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc'); 
      if (field === 'price') setSortDirection('desc');
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItemIndex(index);
    // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || !activeFlow) return;

    const newSubs = [...activeFlow.subscriptions];
    const [movedItem] = newSubs.splice(draggedItemIndex, 1);
    newSubs.splice(dropIndex, 0, movedItem);

    setFlows(prev => prev.map(f => f.id === activeFlow.id ? { ...f, subscriptions: newSubs, updatedAt: Date.now() } : f));
    setDraggedItemIndex(null);
  };

  const moveSubscription = (index: number, direction: -1 | 1) => {
    if (!activeFlow) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= activeFlow.subscriptions.length) return;

    const newSubs = [...activeFlow.subscriptions];
    const temp = newSubs[index];
    newSubs[index] = newSubs[newIndex];
    newSubs[newIndex] = temp;

    setFlows(prev => prev.map(f => f.id === activeFlow.id ? { ...f, subscriptions: newSubs, updatedAt: Date.now() } : f));
  };


  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flows));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `subsflow_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          try {
            const parsed = JSON.parse(e.target.result as string);
            if (Array.isArray(parsed)) {
              setFlows(parsed);
              setIsSettingsOpen(false);
            }
          } catch (error) {
            alert("Invalid JSON");
          }
        }
      };
    }
  };

  const handleCopySyncToken = () => {
    try {
      const token = btoa(unescape(encodeURIComponent(JSON.stringify(flows))));
      navigator.clipboard.writeText(token);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (e) {
      console.error('Encoding error', e);
    }
  };

  const handleLoadSyncToken = () => {
    if (!syncInput) return;
    try {
      const jsonStr = decodeURIComponent(escape(atob(syncInput)));
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        setFlows(parsed);
        setSyncInput('');
        setIsSettingsOpen(false);
      } else {
        alert(t.invalidToken);
      }
    } catch (e) {
      alert(t.invalidToken);
    }
  };

  // Styles
  const isDark = settings.theme === 'dark';
  const bgClass = isDark ? 'bg-[#050505]' : 'bg-[#f9f9f8]';
  const textClass = isDark ? 'text-zinc-200' : 'text-[#1a1a1a]';
  const borderClass = isDark ? 'border-white/10' : 'border-black/5';

  return (
    <div className={`flex flex-col h-screen overflow-hidden theme-transition ${bgClass} ${textClass}`}>
      
      {/* Background Glow Effect */}
      {isDark && (
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      )}

      {/* Top Navigation Bar */}
      <nav className={`relative z-50 flex items-center justify-between px-6 py-4 border-b ${borderClass} bg-opacity-80 backdrop-blur-sm`}>
        <div className="flex items-center gap-6">
          <div className="md:hidden">
             <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -ml-2 text-zinc-400">
               <Menu size={20} />
             </button>
          </div>
          <h1 className="serif text-xl font-bold tracking-tight text-white select-none flex items-center gap-2">
            SubsFlow
            <span className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border ${saveStatus === 'saving' ? 'border-yellow-500/30 text-yellow-500' : 'border-emerald-500/30 text-emerald-500'} transition-colors duration-500 hidden sm:inline-block`}>
               {saveStatus === 'saved' ? t.saved : t.saving}
            </span>
          </h1>
        </div>

        {/* Centered Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl outline-none transition-all duration-300 ${
              isDark 
                ? 'bg-[#121212] border border-white/5 focus:border-white/10 focus:bg-[#1a1a1a] text-zinc-200 placeholder:text-zinc-600' 
                : 'bg-white border border-gray-200 focus:border-gray-300 text-black'
            }`}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2.5 rounded-full transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-zinc-400' : 'bg-gray-100 text-gray-600'}`}
          >
            <Settings size={18} />
          </button>
          <button 
            onClick={handleCreateFlow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <Plus size={16} />
            {t.createFlow}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar / Library */}
        <aside className={`
          fixed md:relative z-40 w-72 h-full flex flex-col border-r ${borderClass} transform gpu theme-transition
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isDark ? 'bg-[#050505]' : 'bg-[#f9f9f8]'}
          transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
        `}>
          <div className="p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">{t.library}</h2>
            <div className="space-y-1">
              {filteredFlows.map((flow, idx) => (
                <div 
                  key={flow.id}
                  onClick={() => { setActiveFlowId(flow.id); setIsMobileMenuOpen(false); }}
                  style={{ animationDelay: `${idx * 40}ms` }}
                  className={`animate-sidebar-entry group relative flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer theme-transition gpu ${
                    activeFlowId === flow.id 
                      ? (isDark ? 'bg-white/5 text-white' : 'bg-white shadow-sm text-black')
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <span className={`text-sm truncate font-medium ${activeFlowId === flow.id ? 'opacity-100' : 'opacity-80'}`}>
                    {flow.title || t.untitled}
                  </span>
                  {activeFlowId === flow.id && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); const next = flows.filter(f => f.id !== flow.id); setFlows(next); if(activeFlowId === flow.id) setActiveFlowId(next[0]?.id || null); }}
                      className="animate-pop p-1.5 text-zinc-500 hover:text-red-400 rounded-md theme-transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden h-full">
          {activeFlow ? (
            <div 
              key={activeFlow.id} 
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Flow Header */}
              <header className="px-8 md:px-12 pt-10 pb-6 flex-shrink-0 animate-entry" style={{ animationDelay: '0ms' }}>
                <div className="flex items-end gap-4 mb-2">
                   <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-1">{t.library} <span className="mx-2 text-zinc-700">/</span></h2>
                </div>
                <input 
                  type="text" 
                  value={activeFlow.title}
                  onChange={(e) => setFlows(prev => prev.map(f => f.id === activeFlow.id ? { ...f, title: e.target.value } : f))}
                  className={`serif text-4xl md:text-5xl font-medium bg-transparent border-none outline-none w-full placeholder-zinc-700 theme-transition leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}
                  placeholder={t.untitled}
                />
                
                {/* Stats */}
                <div className="flex gap-8 mt-8">
                  {[
                    { label: t.totalMonthly, val: totals.monthly },
                    { label: t.totalYearly, val: totals.yearly }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm text-zinc-500">{settings.currency}</span>
                          <span className={`text-2xl serif ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{stat.val.toFixed(2)}</span>
                        </div>
                    </div>
                  ))}
                </div>
              </header>

              {/* Subscriptions List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-12 pb-20">
                <div className="max-w-4xl space-y-2">
                   {/* List Header */}
                   <div className="flex items-center justify-between mb-4 pt-4 border-t border-white/5 animate-entry" style={{ animationDelay: '100ms' }}>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                         {t.subscriptions} <span className="opacity-50">{activeFlow.subscriptions.length}</span>
                      </h3>
                      
                      {/* Sort Controls */}
                      <div className="flex items-center gap-1">
                         <button 
                            onClick={() => toggleSort('manual')} 
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 theme-transition ${sortField === 'manual' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                         >
                            <List size={10} />
                            {t.manual}
                         </button>
                         <button 
                            onClick={() => toggleSort('price')} 
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 theme-transition ${sortField === 'price' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                         >
                            $$$ {sortField === 'price' && <ArrowUpDown size={10} className={sortDirection === 'desc' ? '' : 'rotate-180'} />}
                         </button>
                         <button 
                            onClick={() => toggleSort('category')} 
                            className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 theme-transition ${sortField === 'category' ? 'text-white bg-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                         >
                            {t.category.substring(0,3)} {sortField === 'category' && <ArrowUpDown size={10} className={sortDirection === 'desc' ? '' : 'rotate-180'} />}
                         </button>
                      </div>
                   </div>

                   {activeFlow.subscriptions.length === 0 ? (
                     <div className={`animate-entry flex flex-col items-center justify-center py-32 rounded-3xl opacity-50 theme-transition`} style={{ animationDelay: '200ms' }}>
                       <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 rotate-3 border border-white/5">
                          <PenLine size={24} className="text-zinc-400" />
                       </div>
                       <p className="text-sm font-medium text-zinc-500">{t.startPrompt}</p>
                       <button 
                        onClick={() => setFlows(prev => prev.map(f => f.id === activeFlow.id ? { ...f, subscriptions: [...f.subscriptions, { id: Math.random().toString(36), name: '', description: '', price: 0, billingCycle: BillingCycle.MONTHLY, category: '' }] } : f))}
                        className="mt-4 text-xs text-white underline underline-offset-4 opacity-50 hover:opacity-100 transition-opacity"
                       >
                         {t.addEntry}
                       </button>
                     </div>
                   ) : (
                     <>
                        {sortedSubscriptions.map((sub, i) => {
                          const catColor = getCategoryColor(sub.category);
                          const isManual = sortField === 'manual';

                          return (
                            <div 
                                key={sub.id} 
                                draggable={isManual}
                                onDragStart={(e) => handleDragStart(e, i)}
                                onDragOver={(e) => handleDragOver(e, i)}
                                onDrop={(e) => handleDrop(e, i)}
                                className={`animate-entry group relative flex flex-wrap md:flex-nowrap items-start gap-4 p-4 rounded-xl theme-transition gpu border border-transparent ${
                                  isDark ? 'hover:bg-[#0F0F0F] hover:border-white/5' : 'hover:bg-white hover:shadow-sm'
                                } ${draggedItemIndex === i ? 'opacity-40' : 'opacity-100'}`}
                                style={{ animationDelay: `${150 + (i * 50)}ms`, cursor: isManual ? 'grab' : 'default' }}
                            >
                              {/* Drag Handle (Visible only in Manual Mode) */}
                              {isManual && (
                                <div className="absolute left-1 top-4 p-1 text-zinc-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                                   <GripVertical size={14} />
                                </div>
                              )}

                              {/* Icon / Avatar */}
                              <div className={`w-10 h-10 rounded-full bg-white/5 flex-shrink-0 flex items-center justify-center text-xs font-serif font-bold ${isManual ? 'ml-4' : ''} ${isDark ? 'text-zinc-400' : 'text-zinc-600'} transition-all`}>
                                {sub.name.charAt(0).toUpperCase() || '?'}
                              </div>

                              <div className="flex-1 min-w-0 pt-1 w-full md:w-auto">
                                  <div className="flex items-baseline justify-between gap-4">
                                    <input 
                                      placeholder={t.serviceName}
                                      value={sub.name}
                                      onChange={(e) => handleUpdateSubscription(activeFlow.id, sub.id, { name: e.target.value })}
                                      className={`bg-transparent border-none outline-none font-medium text-base p-0 placeholder:opacity-30 theme-transition w-full ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="relative group/price">
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none">{settings.currency}</span>
                                            <input 
                                              type="number" 
                                              value={sub.price || ''}
                                              onChange={(e) => handleUpdateSubscription(activeFlow.id, sub.id, { price: parseFloat(e.target.value) || 0 })}
                                              className={`w-20 pl-4 py-1 bg-transparent text-right font-medium text-sm outline-none theme-transition ${isDark ? 'text-white' : 'text-black'}`}
                                              placeholder="0"
                                            />
                                        </div>
                                    </div>
                                  </div>
                                  
                                  <input
                                    value={sub.description}
                                    onChange={(e) => handleUpdateSubscription(activeFlow.id, sub.id, { description: e.target.value })}
                                    placeholder={t.descriptionPlaceholder}
                                    className={`mt-1 w-full bg-transparent text-xs outline-none theme-transition ${isDark ? 'text-zinc-500 placeholder:text-zinc-700' : 'text-zinc-500 placeholder:text-zinc-300'}`}
                                  />
                              </div>

                              {/* Actions - Responsive Layout */}
                              <div className={`w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-2 mt-3 md:mt-0 transition-opacity ${isManual ? '' : ''} opacity-100 md:opacity-0 md:group-hover:opacity-100`}>
                                  <div className="flex gap-2">
                                      {/* Custom Category Input (Tag Style) */}
                                      <div className={`relative flex items-center bg-white/5 rounded-lg border border-white/5 overflow-hidden transition-colors focus-within:bg-white/10 group-hover/cat:bg-white/10`}>
                                          <div className="pl-2 flex items-center pointer-events-none">
                                            <Tag size={10} className={catColor} />
                                          </div>
                                          <input 
                                            value={sub.category || ''}
                                            onChange={(e) => handleUpdateSubscription(activeFlow.id, sub.id, { category: e.target.value })}
                                            placeholder={t.categoryPlaceholder}
                                            className="w-24 bg-transparent border-none outline-none text-[10px] px-2 py-1.5 font-medium text-zinc-400 focus:text-white placeholder:text-zinc-700 uppercase tracking-wider"
                                          />
                                      </div>

                                      <CustomSelect 
                                          value={sub.billingCycle} 
                                          onChange={(v) => handleUpdateSubscription(activeFlow.id, sub.id, { billingCycle: v as BillingCycle })}
                                          options={[
                                            { value: BillingCycle.MONTHLY, label: t.monthly },
                                            { value: BillingCycle.YEARLY, label: t.yearly }
                                          ]}
                                      />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                     {/* Mobile Move Controls (visible in Manual mode) */}
                                     {isManual && (
                                        <div className="flex bg-white/5 rounded-lg border border-white/5">
                                            <button 
                                              onClick={() => moveSubscription(i, -1)}
                                              className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30"
                                              disabled={i === 0}
                                            >
                                              <ArrowUp size={12} />
                                            </button>
                                            <div className="w-px bg-white/10 my-1"></div>
                                            <button 
                                              onClick={() => moveSubscription(i, 1)}
                                              className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30"
                                              disabled={i === sortedSubscriptions.length - 1}
                                            >
                                              <ArrowDown size={12} />
                                            </button>
                                        </div>
                                     )}

                                     <button 
                                      onClick={() => setFlows(prev => prev.map(f => f.id === activeFlow.id ? { ...f, subscriptions: f.subscriptions.filter(s => s.id !== sub.id) } : f))}
                                      className="p-1.5 text-zinc-600 hover:text-red-400 rounded-md transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        <button 
                          onClick={() => setFlows(prev => prev.map(f => f.id === activeFlow.id ? { ...f, subscriptions: [...f.subscriptions, { id: Math.random().toString(36), name: '', description: '', price: 0, billingCycle: BillingCycle.MONTHLY, category: '' }] } : f))}
                          className={`mt-6 w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-medium theme-transition ${isDark ? 'border-white/10 text-zinc-500 hover:bg-white/5 hover:text-zinc-300' : 'border-black/10 text-zinc-500 hover:bg-black/5'}`}
                        >
                          <Plus size={14} />
                          {t.addEntry}
                        </button>
                     </>
                   )}
                </div>
              </div>
            </div>
          ) : (
            // The Void - Empty State
            <div className="flex-1 flex flex-col items-center justify-center animate-pop relative">
               <div className="w-24 h-24 rounded-[2rem] bg-[#121212] border border-white/5 flex items-center justify-center mb-8 shadow-2xl shadow-purple-900/10">
                  <PenLine size={32} className="text-zinc-500 opacity-80" />
               </div>
               <h2 className="serif text-2xl md:text-3xl text-zinc-200 mb-3">{t.emptyTitle}</h2>
               <p className="text-zinc-600 text-sm">{t.emptySubtitle}</p>
               
               <button 
                  onClick={handleCreateFlow}
                  className="mt-8 px-6 py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-105 transition-transform"
               >
                 {t.createFlow}
               </button>
            </div>
          )}
        </main>

      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-entry" style={{ animationDuration: '300ms' }}>
           <div className={`gpu w-full max-w-sm max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl shadow-2xl animate-pop theme-transition border ${isDark ? 'bg-[#0F0F0F] border-white/10 text-zinc-200' : 'bg-white border-gray-200 text-zinc-800'}`}>
              <div className="p-6 flex justify-between items-center border-b border-white/5 sticky top-0 bg-inherit z-10">
                <h2 className="serif text-lg font-medium">{t.settings}</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 rounded-full hover:bg-white/5 theme-transition"><X size={18} /></button>
              </div>
              
              <div className="p-6 space-y-6">
                
                {/* Cross-Device Sync (Token) */}
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-zinc-500 mb-1">
                      <Smartphone size={14} />
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t.sync}</label>
                   </div>
                   <div className="space-y-3 p-4 rounded-2xl border border-white/5 bg-white/5">
                      <button 
                        onClick={handleCopySyncToken}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isDark ? 'bg-black/40 border-white/10 hover:bg-black/60' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                      >
                         <span className="text-xs font-medium">{copyFeedback ? t.tokenCopied : t.copyToken}</span>
                         {copyFeedback ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} className="opacity-50" />}
                      </button>
                      
                      <div className="flex gap-2">
                         <input 
                            value={syncInput}
                            onChange={(e) => setSyncInput(e.target.value)}
                            placeholder={t.pasteToken}
                            className={`flex-1 min-w-0 bg-transparent text-xs p-2 rounded-lg border outline-none ${isDark ? 'border-white/10 focus:border-white/30' : 'border-gray-200 focus:border-gray-400'}`}
                         />
                         <button 
                            onClick={handleLoadSyncToken}
                            disabled={!syncInput}
                            className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold disabled:opacity-50"
                         >
                           {t.loadToken}
                         </button>
                      </div>
                   </div>
                </div>

                <div className="w-full h-px bg-white/5"></div>

                {/* File Management */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t.data}</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleExport} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                           <Download size={16} />
                           <span className="text-xs font-medium">{t.export}</span>
                        </button>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <button className={`w-full h-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
                              <Upload size={16} />
                              <span className="text-xs font-medium">{t.import}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5"></div>

                {/* Theme & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t.theme}</label>
                    <div className={`flex rounded-lg p-1 theme-transition ${isDark ? 'bg-black border border-white/5' : 'bg-gray-100'}`}>
                       <button onClick={() => setSettings(s => ({...s, theme: 'light'}))} className={`flex-1 flex justify-center py-2 rounded-md theme-transition ${settings.theme === 'light' ? 'bg-white shadow-sm' : 'opacity-30'}`}><Sun size={16} /></button>
                       <button onClick={() => setSettings(s => ({...s, theme: 'dark'}))} className={`flex-1 flex justify-center py-2 rounded-md theme-transition ${settings.theme === 'dark' ? 'bg-white/10 text-white' : 'opacity-30'}`}><Moon size={16} /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t.language}</label>
                    <div className={`flex rounded-lg p-1 theme-transition ${isDark ? 'bg-black border border-white/5' : 'bg-gray-100'}`}>
                       <button onClick={() => setSettings(s => ({...s, language: 'en'}))} className={`flex-1 flex justify-center py-2 rounded-md text-[10px] font-bold theme-transition ${settings.language === 'en' ? (isDark ? 'bg-white/10 shadow-sm' : 'bg-white shadow-sm') : 'opacity-30'}`}>EN</button>
                       <button onClick={() => setSettings(s => ({...s, language: 'ru'}))} className={`flex-1 flex justify-center py-2 rounded-md text-[10px] font-bold theme-transition ${settings.language === 'ru' ? (isDark ? 'bg-white/10 shadow-sm' : 'bg-white shadow-sm') : 'opacity-30'}`}>RU</button>
                    </div>
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50">{t.currency}</label>
                  <div className="flex gap-2">
                    {['$', '€', '£', '₽'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setSettings(s => ({...s, currency: c}))}
                        className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-serif font-medium theme-transition hover:scale-105 active:scale-95 border ${
                          settings.currency === c 
                            ? 'bg-white text-black border-white' 
                            : (isDark ? 'bg-transparent border-white/10 hover:border-white/30' : 'bg-gray-50 border-gray-200')
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
