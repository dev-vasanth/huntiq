import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  plan: { type: String, enum: ['starter', 'pro'], default: 'starter' },

  subscription: {
    stripeCustomerId:     { type: String },
    stripeSubscriptionId: { type: String },
    stripePriceId:        { type: String },
    status: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'canceled', 'incomplete', 'none'],
      default: 'none',
    },
    trialEndsAt:      { type: Date },
    currentPeriodEnd: { type: Date },
  },

  usage: {
    leadsThisMonth:   { type: Number, default: 0 },
    repliesThisMonth: { type: Number, default: 0 },
    resetAt:          { type: Date, default: () => new Date() },
  },

  alertSettings: {
    enabled:        { type: Boolean, default: false },
    email:          { type: String },
    threshold:      { type: Number, default: 70 },  // min intent score to trigger alert
    lastAlertedAt:  { type: Date },
  },

  digestSettings: {
    enabled: { type: Boolean, default: false },
    email: { type: String },
    time: { type: String, default: '08:00' },
    timezone: { type: String, default: 'UTC' },
  },
  redditAuth: {
    connected: { type: Boolean, default: false },
    accessToken: { type: String },
    refreshToken: { type: String },
    username: { type: String },
    connectedAt: { type: Date },
  },
  isVerified:           { type: Boolean, default: false },
  emailVerifyToken:     { type: String },
  emailVerifyExpires:   { type: Date },

  passwordResetToken:   { type: String },
  passwordResetExpires: { type: Date },

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  if (obj.redditAuth) {
    delete obj.redditAuth.accessToken;
    delete obj.redditAuth.refreshToken;
  }
  return obj;
};

export default mongoose.model('User', userSchema);
