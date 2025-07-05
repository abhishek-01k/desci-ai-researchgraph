import connectDB from './connect';
import Analysis from './models/Analysis';

export async function getAnalysisByUrl(repositoryUrl: string) {
    await connectDB();
    return await Analysis.findOne({ repositoryUrl }).sort({ createdAt: -1 });
}

export async function getAllAnalyses(limit = 50, skip = 0) {
    await connectDB();
    return await Analysis.find().sort({ createdAt: -1 }).limit(limit).skip(skip);
}

export async function getAnalysisById(id: string) {
    await connectDB();
    return await Analysis.findById(id);
}

export async function deleteAnalysis(id: string) {
    await connectDB();
    return await Analysis.findByIdAndDelete(id);
}

export async function getAnalysesByPlatform(platform: 'github' | 'gitlab', limit = 50) {
    await connectDB();
    return await Analysis.find({ platform }).sort({ createdAt: -1 }).limit(limit);
} 