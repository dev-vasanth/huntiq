import Reply from '../models/Reply.js';
import Lead from '../models/Lead.js';
import { generateReply } from '../services/aiService.js';

export const getReplies = async (req, res) => {
  try {
    const replies = await Reply.find({ userId: req.user._id, leadId: req.params.leadId })
      .sort({ createdAt: -1 });
    res.json({ replies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const generateAIReply = async (req, res) => {
  try {
    const { leadId, tone = 'professional', context = '' } = req.body;

    const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const content = await generateReply({ lead, tone, context });

    const reply = await Reply.create({
      leadId,
      userId: req.user._id,
      content,
      isAI: true,
      tone,
    });

    res.status(201).json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const saveManualReply = async (req, res) => {
  try {
    const { leadId, content, tone = 'professional' } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const lead = await Lead.findOne({ _id: leadId, userId: req.user._id });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const reply = await Reply.create({
      leadId,
      userId: req.user._id,
      content,
      isAI: false,
      tone,
    });

    res.status(201).json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markReplySent = async (req, res) => {
  try {
    const reply = await Reply.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isSent: true, sentAt: new Date() },
      { new: true }
    );
    if (!reply) return res.status(404).json({ message: 'Reply not found' });

    // Update lead status to replied
    await Lead.findByIdAndUpdate(reply.leadId, {
      status: 'replied',
      repliedAt: new Date(),
      replyContent: reply.content,
    });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReply = async (req, res) => {
  try {
    await Reply.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Reply deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
