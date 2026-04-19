import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  keywordId: { type: mongoose.Schema.Types.ObjectId, ref: 'Keyword', required: true },
  keywordText: { type: String },
  keywordType: { type: String, enum: ['own', 'competitor'], default: 'own' },

  // Source platform
  source: { type: String, enum: ['reddit', 'hackernews'], default: 'reddit' },

  // Source post identifier (Reddit post ID or HN objectID)
  redditId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  url: { type: String, required: true },
  permalink: { type: String },
  subreddit: { type: String, required: true },
  author: { type: String },
  upvotes: { type: Number, default: 0 },
  numComments: { type: Number, default: 0 },
  redditCreatedAt: { type: Date },
  postType: { type: String, enum: ['discussion', 'link'], default: 'discussion' },
  hasBody: { type: Boolean, default: false }, // true = post has meaningful text body

  // Scoring & Analysis
  intentScore: { type: Number, default: 0, min: 0, max: 100 },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  intentSignals: [{ type: String }], // signals detected

  // Status
  status: {
    type: String,
    enum: ['new', 'saved', 'replied', 'dismissed'],
    default: 'new',
  },

  // Reply tracking
  repliedAt: { type: Date },
  replyContent: { type: String },
}, { timestamps: true });

leadSchema.index({ userId: 1, source: 1, redditId: 1 }, { unique: true });
leadSchema.index({ userId: 1, source: 1 });
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, intentScore: -1 });
leadSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Lead', leadSchema);
