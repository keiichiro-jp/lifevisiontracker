import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateInitialHypothesis, generateNextQuestion, generateFinalVision } from "./ai";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const scryptAsync = promisify(scrypt);
const PASSWORD_PREFIX = "scrypt";

function sanitizeUser<T extends { password: string }>(user: T) {
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${PASSWORD_PREFIX}:${salt}:${buf.toString("hex")}`;
}

function isHashedPassword(password: string) {
  return password.startsWith(`${PASSWORD_PREFIX}:`);
}

async function verifyPassword(password: string, storedPassword: string) {
  if (!isHashedPassword(storedPassword)) {
    return password === storedPassword;
  }

  const [, salt, storedHash] = storedPassword.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const storedBuffer = Buffer.from(storedHash, "hex");
  const suppliedBuffer = (await scryptAsync(password, salt, storedBuffer.length)) as Buffer;
  return timingSafeEqual(storedBuffer, suppliedBuffer);
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
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
      const user = await storage.createUser({ username, password: await hashPassword(password), email });
      req.session.userId = user.id;
      
      // Send response without password
      res.status(201).json(sanitizeUser(user));
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
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      if (!isHashedPassword(user.password)) {
        await storage.updateUserPassword(user.id, await hashPassword(password));
      }
      req.session.userId = user.id;
      
      // Send response without password
      res.status(200).json(sanitizeUser(user));
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      res.status(204).end();
    });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        req.session.destroy(() => undefined);
        return res.status(401).json({ message: "Authentication required" });
      }
      res.status(200).json(sanitizeUser(user));
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Failed to get current user" });
    }
  });

  // Vision data routes
  app.post('/api/vision', requireAuth, async (req, res) => {
    try {
      const { basicInfo, questionnaire, aiQuestions, visionResults, createdAt } = req.body;
      
      const visionData = await storage.createVisionData({
        userId: req.session.userId!,
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

  app.get('/api/vision/me', requireAuth, async (req, res) => {
    try {
      const visionData = await storage.getVisionDataByUserId(req.session.userId!);
      
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
  app.patch('/api/vision/:id/public', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isPublic } = req.body;
      
      if (typeof isPublic !== 'boolean') {
        return res.status(400).json({ message: "isPublic must be a boolean value" });
      }

      const visionData = await storage.getVisionDataById(id);
      if (!visionData) {
        return res.status(404).json({ message: "Vision data not found" });
      }
      if (visionData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedVision = await storage.updateVisionPublicStatus(id, isPublic);
      res.status(200).json(updatedVision);
    } catch (error) {
      console.error("Error updating vision public status:", error);
      res.status(500).json({ message: "Failed to update vision public status" });
    }
  });
  
  // Share a vision to community
  app.post('/api/community/visions', requireAuth, async (req, res) => {
    try {
      const { visionId, title, keyMessage, visionSummary } = req.body;
      
      // Validate input
      if (!visionId || !title || !keyMessage || !visionSummary) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const visionData = await storage.getVisionDataById(visionId);
      if (!visionData) {
        return res.status(404).json({ message: "Vision data not found" });
      }
      if (visionData.userId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const sharedVision = await storage.createSharedVision({
        userId: req.session.userId!,
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
      res.status(200).json({ visions: sharedVisions });
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
      
      res.status(200).json({ vision: sharedVision });
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
  app.post('/api/community/visions/:id/comments', requireAuth, async (req, res) => {
    try {
      const sharedVisionId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const comment = await storage.createVisionComment({
        sharedVisionId,
        userId: req.session.userId!,
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
      res.status(200).json({ comments });
    } catch (error) {
      console.error("Error getting comments:", error);
      res.status(500).json({ message: "Failed to get comments" });
    }
  });
  
  // Like a shared vision
  app.post('/api/community/visions/:id/like', requireAuth, async (req, res) => {
    try {
      const sharedVisionId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
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
  app.get('/api/community/visions/:id/like', requireAuth, async (req, res) => {
    try {
      const sharedVisionId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      const hasLiked = await storage.hasUserLikedVision(sharedVisionId, userId);
      res.status(200).json({ liked: hasLiked });
    } catch (error) {
      console.error("Error checking like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
