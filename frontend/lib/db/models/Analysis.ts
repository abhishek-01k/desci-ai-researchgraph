import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysis extends Document {
    repositoryUrl: string;
    platform: 'github' | 'gitlab';
    content: string;
    llmResponse: any;
    processedData: any;
    success: boolean;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>({
    repositoryUrl: {
        type: String,
        required: true,
        index: true
    },
    platform: {
        type: String,
        enum: ['github', 'gitlab'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    llmResponse: {
        type: Schema.Types.Mixed,
        required: true
    },
    processedData: {
        type: Schema.Types.Mixed,
        required: true
    },
    success: {
        type: Boolean,
        required: true,
        default: false
    },
    message: {
        type: String
    }
}, {
    timestamps: true
});

// Create index for better query performance
AnalysisSchema.index({ createdAt: -1 });
AnalysisSchema.index({ repositoryUrl: 1, createdAt: -1 });

export default mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema); 