import mongoose, { Schema, Document, Model } from "mongoose";

// Caches the AI's full text response keyed by a hash of the user's prompt
// (and the active model). Used to make repeated identical demos deterministic
// — second time you paste the same prompt, you get back the exact same files
// without burning another LLM call.
//
// Cache hits are replayed to the client as a simulated 20-second stream so
// the UX is indistinguishable from a fresh generation.

export interface IGenerationCache extends Document {
  promptHash: string;
  userMessage: string;
  modelId: string;
  modelName: string;
  provider: string;
  fullText: string;
  hitCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GenerationCacheSchema = new Schema<IGenerationCache>(
  {
    promptHash: { type: String, required: true, unique: true, index: true },
    userMessage: { type: String, required: true },
    modelId: { type: String, required: true },
    modelName: { type: String, required: true },
    provider: { type: String, required: true },
    fullText: { type: String, required: true },
    hitCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const GenerationCache: Model<IGenerationCache> =
  mongoose.models.GenerationCache ||
  mongoose.model<IGenerationCache>("GenerationCache", GenerationCacheSchema);

export default GenerationCache;
