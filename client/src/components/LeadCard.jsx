import { ExternalLink, MessageSquare, Bookmark, X, ArrowUp, Clock, Crosshair, FileText, Link2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function IntentBadge({ score }) {
  if (score >= 70) return <span className="badge score-high">High Intent</span>;
  if (score >= 40) return <span className="badge score-medium">Medium Intent</span>;
  return <span className="badge score-low">Low Intent</span>;
}

function SentimentDot({ sentiment }) {
  const colors = { positive: 'bg-emerald-500', neutral: 'bg-slate-500', negative: 'bg-red-500' };
  return <span className={`w-2 h-2 rounded-full ${colors[sentiment] || 'bg-slate-500'} shrink-0`} title={sentiment} />;
}

export default function LeadCard({ lead, onReply, onStatus }) {
  const score = lead.intentScore || 0;
  const scoreColor = score >= 70 ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    : score >= 40 ? 'text-amber-400 bg-amber-500/20 border-amber-500/30'
    : 'text-slate-400 bg-slate-700/50 border-slate-600';

  return (
    <div className="card p-5 hover:border-slate-600 transition-all group">
      <div className="flex items-start gap-4">
        {/* Score */}
        <div className={`shrink-0 w-12 h-12 rounded-xl border flex flex-col items-center justify-center ${scoreColor}`}>
          <span className="text-lg font-bold leading-none">{score}</span>
          <span className="text-[9px] opacity-70 leading-none mt-0.5">score</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-semibold text-violet-400">r/{lead.subreddit}</span>
            <span className="text-slate-600">·</span>
            <SentimentDot sentiment={lead.sentiment} />
            <IntentBadge score={score} />
            {/* Post type pill — discussion vs link */}
            {lead.postType === 'discussion' ? (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/50" title="Text discussion post">
                <FileText size={10} /> Discussion
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/50" title="Link post">
                <Link2 size={10} /> Link
              </span>
            )}
            {lead.keywordText && (
              <span className="badge bg-slate-700 text-slate-400 border-slate-600">{lead.keywordText}</span>
            )}
            {lead.keywordType === 'competitor' && (
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                <Crosshair size={10} /> Competitor
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white text-sm leading-snug mb-2 line-clamp-2">
            <a href={lead.permalink} target="_blank" rel="noopener noreferrer"
              className="hover:text-violet-300 transition-colors">
              {lead.title}
            </a>
          </h3>

          {/* Body snippet */}
          {lead.body && (
            <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-2">{lead.body}</p>
          )}

          {/* Intent signals */}
          {lead.intentSignals?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {lead.intentSignals.slice(0, 4).map(signal => (
                <span key={signal} className="text-[11px] text-violet-400/70 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  🎯 {signal}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ArrowUp size={11} />
                {lead.upvotes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={11} />
                {lead.numComments}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {lead.redditCreatedAt ? formatDistanceToNow(new Date(lead.redditCreatedAt), { addSuffix: true }) : 'recently'}
              </span>
              {lead.author && <span>u/{lead.author}</span>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <a href={lead.permalink} target="_blank" rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-all" title="Open on Reddit">
                <ExternalLink size={14} />
              </a>
              {lead.status !== 'saved' && (
                <button onClick={() => onStatus(lead._id, 'saved')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all" title="Save">
                  <Bookmark size={14} />
                </button>
              )}
              <button onClick={() => onReply(lead)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30 transition-all">
                <MessageSquare size={12} />
                Reply
              </button>
              {lead.status !== 'dismissed' && (
                <button onClick={() => onStatus(lead._id, 'dismissed')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Dismiss">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
