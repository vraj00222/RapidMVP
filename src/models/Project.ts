import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface IProject extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  status: "draft" | "generating" | "ready" | "deployed";
  techStack: string[];
  files: IProjectFile[];
  thumbnail: string;
  generationCount: number;
  chatHistory: {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "generating", "ready", "deployed"],
      default: "draft",
    },
    techStack: {
      type: [String],
      default: [],
    },
    files: [
      {
        path: { type: String, required: true },
        content: { type: String, required: true },
        language: { type: String, default: "typescript" },
      },
    ],
    thumbnail: {
      type: String,
      default: "",
    },
    generationCount: {
      type: Number,
      default: 0,
    },
    chatHistory: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ owner: 1, createdAt: -1 });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
