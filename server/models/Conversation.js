import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  body:            { type: String, required: true },
  author:          { type: String },            // Reddit username who replied
  redditMessageId: { type: String },
  receivedAt:      { type: Date, default: Date.now },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leadId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },

  // Who we messaged
  redditUsername: { type: String, required: true },

  // What we sent
  subject:    { type: String, required: true },
  ourMessage: { type: String, required: true },
  sentAt:     { type: Date, default: Date.now },

  // Denormalized lead context for quick display
  leadTitle:     { type: String },
  leadSubreddit: { type: String },
  leadPermalink: { type: String },

  // Thread replies from the other person
  replies: [replySchema],

  // Status
  status: {
    type: String,
    enum: ['sent', 'replied', 'no_reply', 'closed'],
    default: 'sent',
  },

  // Performance
  responseTimeMs: { type: Number },   // ms until first reply (null = no reply yet)
  lastCheckedAt:  { type: Date },
}, { timestamps: true });

conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, status: 1 });
conversationSchema.index({ userId: 1, redditUsername: 1 });

export default mongoose.model('Conversation', conversationSchema);
