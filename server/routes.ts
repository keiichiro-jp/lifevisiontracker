import type { Express } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { generateInitialHypothesis, generateNextQuestion, generateFinalVision } from "./ai";
import { researchCompany, researchCompetitor } from "./company-research";

// Registers every API route on the given Express app and nothing else.
// It must not create or listen on an HTTP server: the local entrypoint
// (server/index.ts) owns the listener, while on Vercel (api/index.ts) the
// platform owns it and only the bare app is exported.
export function registerRoutes(app: Express): void {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create user
      const user = await storage.createUser({ username, password, email });
      
      // Send response without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Send response without password
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // Vision data routes
  app.post('/api/vision', async (req, res) => {
    try {
      const { userId, basicInfo, questionnaire, aiQuestions, visionResults, createdAt } = req.body;
      
      const visionData = await storage.createVisionData({
        userId,
        basicInfo,
        questionnaire,
        aiQuestions,
        visionResults,
        createdAt
      });
      
      res.status(201).json(visionData);
    } catch (error) {
      console.error("Error saving vision data:", error);
      res.status(500).json({ message: "Failed to save vision data" });
    }
  });

  app.get('/api/vision/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const visionData = await storage.getVisionDataByUserId(userId);
      
      if (!visionData) {
        return res.status(404).json({ message: "Vision data not found" });
      }
      
      res.status(200).json(visionData);
    } catch (error) {
      console.error("Error getting vision data:", error);
      res.status(500).json({ message: "Failed to get vision data" });
    }
  });

  // AI routes
  app.post('/api/ai/init-hypothesis', async (req, res) => {
    try {
      const userData = req.body;
      const result = await generateInitialHypothesis(userData);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error generating initial hypothesis:", error);
      res.status(500).json({ 
        message: "Failed to generate initial hypothesis", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.post('/api/ai/next-question', async (req, res) => {
    try {
      const { currentHypothesis, currentQuestion, userAnswer } = req.body;
      const result = await generateNextQuestion(currentHypothesis, currentQuestion, userAnswer);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error generating next question:", error);
      res.status(500).json({ 
        message: "Failed to generate next question", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post('/api/ai/final-vision', async (req, res) => {
    try {
      const { finalHypothesis } = req.body;
      const result = await generateFinalVision(finalHypothesis);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error generating final vision:", error);
      res.status(500).json({ 
        message: "Failed to generate final vision", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Community platform routes
  
  // Update vision data public status
  app.patch('/api/vision/:id/public', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isPublic } = req.body;
      
      if (typeof isPublic !== 'boolean') {
        return res.status(400).json({ message: "isPublic must be a boolean value" });
      }
      
      const updatedVision = await storage.updateVisionPublicStatus(id, isPublic);
      res.status(200).json(updatedVision);
    } catch (error) {
      console.error("Error updating vision public status:", error);
      res.status(500).json({ message: "Failed to update vision public status" });
    }
  });
  
  // Share a vision to community
  app.post('/api/community/visions', async (req, res) => {
    try {
      const { userId, visionId, title, keyMessage, visionSummary } = req.body;
      
      // Validate input
      if (!userId || !visionId || !title || !keyMessage || !visionSummary) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const sharedVision = await storage.createSharedVision({
        userId,
        visionId,
        title,
        keyMessage,
        visionSummary
      });
      
      res.status(201).json(sharedVision);
    } catch (error) {
      console.error("Error sharing vision:", error);
      res.status(500).json({ message: "Failed to share vision" });
    }
  });
  
  // Get all shared visions with pagination
  app.get('/api/community/visions', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const sharedVisions = await storage.getSharedVisions(limit, offset);
      res.status(200).json(sharedVisions);
    } catch (error) {
      console.error("Error getting shared visions:", error);
      res.status(500).json({ message: "Failed to get shared visions" });
    }
  });
  
  // Get a specific shared vision by ID
  app.get('/api/community/visions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sharedVision = await storage.getSharedVisionById(id);
      
      if (!sharedVision) {
        return res.status(404).json({ message: "Shared vision not found" });
      }
      
      // Increment view count
      await storage.incrementSharedVisionViews(id);
      
      res.status(200).json(sharedVision);
    } catch (error) {
      console.error("Error getting shared vision:", error);
      res.status(500).json({ message: "Failed to get shared vision" });
    }
  });
  
  // Get all shared visions for a specific user
  app.get('/api/community/users/:userId/visions', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sharedVisions = await storage.getSharedVisionsByUserId(userId);
      res.status(200).json(sharedVisions);
    } catch (error) {
      console.error("Error getting user's shared visions:", error);
      res.status(500).json({ message: "Failed to get user's shared visions" });
    }
  });
  
  // Add a comment to a shared vision
  app.post('/api/community/visions/:id/comments', async (req, res) => {
    try {
      const sharedVisionId = parseInt(req.params.id);
      const { userId, content } = req.body;
      
      if (!userId || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const comment = await storage.createVisionComment({
        sharedVisionId,
        userId,
        content
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });
  
  // Get all comments for a shared vision
  app.get('/api/community/visions/:id/comments', async (req, res) => {
    try {
      const sharedVisionId = parseInt(req.params.id);
      const comments = await storage.getVisionCommentsBySharedVisionId(sharedVisionId);
      res.status(200).json(comments);
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });
  
  // Like a shared vision
  app.post('/api/community/visions/:id/like', async (req, res) => {
    try {
      const sharedVisionId = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "Missing userId" });
      }
      
      // Check if user has already liked this vision
      const hasLiked = await storage.hasUserLikedVision(sharedVisionId, userId);
      
      if (hasLiked) {
        // User already liked this vision, so remove the like
        await storage.deleteVisionLike(sharedVisionId, userId);
        res.status(200).json({ liked: false });
      } else {
        // User hasn't liked this vision yet, so add a like
        await storage.createVisionLike({
          sharedVisionId,
          userId
        });
        res.status(201).json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });
  
  // Check if a user has liked a shared vision
  app.get('/api/community/visions/:id/like/:userId', async (req, res) => {
    try {
      const sharedVisionId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      const hasLiked = await storage.hasUserLikedVision(sharedVisionId, userId);
      res.status(200).json({ liked: hasLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  // ===== Company Research Routes =====

  // Start a new company research
  app.post('/api/company-research', async (req, res) => {
    try {
      const { companyName } = req.body;
      if (!companyName || typeof companyName !== 'string') {
        return res.status(400).json({ message: "companyName is required" });
      }
      const aiResult = await researchCompany(companyName.trim());
      const record = await storage.createCompanyResearch({
        companyName: companyName.trim(),
        officialName: aiResult.officialName || null,
        industry: aiResult.industry || null,
        summary: aiResult.summary || null,
        organizationStructure: aiResult.organizationStructure || null,
        businessOperations: aiResult.businessOperations || [],
        competitors: aiResult.competitors || [],
        sources: aiResult.sources || [],
      });
      res.status(201).json(record);
    } catch (error) {
      console.error("Error researching company:", error);
      res.status(500).json({ message: "Failed to research company", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Research a competitor (one-click)
  app.post('/api/company-research/competitor', async (req, res) => {
    try {
      const { competitorName, originalCompany } = req.body;
      if (!competitorName || !originalCompany) {
        return res.status(400).json({ message: "competitorName and originalCompany are required" });
      }
      const aiResult = await researchCompetitor(competitorName.trim(), originalCompany.trim());
      const record = await storage.createCompanyResearch({
        companyName: competitorName.trim(),
        officialName: aiResult.officialName || null,
        industry: aiResult.industry || null,
        summary: aiResult.summary || null,
        organizationStructure: aiResult.organizationStructure || null,
        businessOperations: aiResult.businessOperations || [],
        competitors: aiResult.competitors || [],
        sources: aiResult.sources || [],
      });
      res.status(201).json(record);
    } catch (error) {
      console.error("Error researching competitor:", error);
      res.status(500).json({ message: "Failed to research competitor", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Get research history
  app.get('/api/company-research', async (req, res) => {
    try {
      const list = await storage.getCompanyResearchList();
      res.status(200).json(list);
    } catch (error) {
      console.error("Error getting research history:", error);
      res.status(500).json({ message: "Failed to get research history" });
    }
  });

  // Get single research record
  app.get('/api/company-research/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getCompanyResearchById(id);
      if (!record) {
        return res.status(404).json({ message: "Research not found" });
      }
      res.status(200).json(record);
    } catch (error) {
      console.error("Error getting research:", error);
      res.status(500).json({ message: "Failed to get research" });
    }
  });

  // Delete research record
  app.delete('/api/company-research/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCompanyResearch(id);
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Error deleting research:", error);
      res.status(500).json({ message: "Failed to delete research" });
    }
  });
}
