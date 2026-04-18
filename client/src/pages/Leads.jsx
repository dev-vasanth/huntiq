import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, SlidersHorizontal, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import api from '../utils/api';
import LeadCard from '../components/LeadCard';
import ReplyModal from '../components/ReplyModal';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'saved', label: 'Saved' },
  { value: 'replied', label: 'Replied' },
  { value: 'dismissed', label: 'Dismissed' },
];

const SORT_OPTIONS = [
  { value: 'intentScore', label: 'Intent Score' },
  { value: 'createdAt', label: 'Date Added' },
  { value: 'upvotes', label: 'Upvotes' },
];

const SCORE_FILTERS = [
  { value: 0, label: 'All Scores' },
  { value: 70, label: '70+ High Intent' },
  { value: 40, label: '40+ Medium+' },
];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [scanMsg, setScanMsg] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  const [filters, setFilters] = useState({
    status: 'all', keyword: '', sortBy: 'intentScore',
    sortOrder: 'desc', minScore: 0, page: 1, keywordType: '', campaignId: '',
  });
  const [exporting, setExporting] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 15 };
      const res = await api.get('/leads', { params });
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    api.get('/campaigns').then(res => setCampaigns(res.data.campaigns || [])).catch(() => {});
  }, []);

  const setFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: key === 'page' ? value : 1 }));

  const handleStatus = async (id, status) => {
    await api.patch(`/leads/${id}/status`, { status });
    setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        status: filters.status,
        keyword: filters.keyword,
        minScore: filters.minScore,
        keywordType: filters.keywordType,
        campaignId: filters.campaignId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      const res = await api.get('/leads/export', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `huntiq-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setScanMsg('');
    try {
      const res = await api.post('/leads/scan');
      setScanMsg(res.data.message);
      fetchLeads();
    } catch (err) {
      setScanMsg(err.response?.data?.message || 'Scan failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pagination.total} total leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
            <Download size={15} className={exporting ? 'animate-pulse' : ''} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button onClick={handleScan} disabled={scanning} className="btn-primary flex items-center gap-2 text-sm">
            <RefreshCw size={15} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {scanMsg && (
        <div className={`mb-4 p-3 rounded-lg text-sm border ${scanMsg.includes('failed') ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
          {scanMsg}
        </div>
      )}

      {/* Filters bar */}
      <div className="card p-4 mb-5 space-y-3">
        {/* Status tabs */}
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter('status', tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filters.status === tab.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & sort */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={filters.keyword}
              onChange={e => setFilter('keyword', e.target.value)}
              className="input pl-9 text-sm"
              placeholder="Search by keyword..."
            />
          </div>

          <select
            value={filters.minScore}
            onChange={e => setFilter('minScore', parseInt(e.target.value))}
            className="input w-44 text-sm">
            {SCORE_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            value={filters.keywordType}
            onChange={e => setFilter('keywordType', e.target.value)}
            className="input w-40 text-sm">
            <option value="">All Types</option>
            <option value="own">Own Brand</option>
            <option value="competitor">Competitor</option>
          </select>

          <select
            value={filters.campaignId}
            onChange={e => setFilter('campaignId', e.target.value)}
            className="input w-44 text-sm">
            <option value="">All Campaigns</option>
            {campaigns.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={e => setFilter('sortBy', e.target.value)}
            className="input w-40 text-sm">
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <button
            onClick={() => setFilter('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
            className="btn-secondary text-sm px-3 flex items-center gap-1.5">
            <SlidersHorizontal size={14} />
            {filters.sortOrder === 'desc' ? 'Desc' : 'Asc'}
          </button>
        </div>
      </div>

      {/* Leads list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="card p-16 text-center text-slate-400">
          <Filter size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white mb-1">No leads found</p>
          <p className="text-sm">Try adjusting your filters or run a scan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <LeadCard
              key={lead._id}
              lead={lead}
              onReply={setSelectedLead}
              onStatus={handleStatus}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setFilter('page', filters.page - 1)}
            disabled={filters.page === 1}
            className="btn-secondary px-3 py-2 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400">
            Page {filters.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setFilter('page', filters.page + 1)}
            disabled={filters.page >= pagination.pages}
            className="btn-secondary px-3 py-2 disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {selectedLead && (
        <ReplyModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onReplied={() => { fetchLeads(); setSelectedLead(null); }}
        />
      )}
    </div>
  );
}
