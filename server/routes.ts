import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { generateInitialHypothesis, generateNextQuestion, generateFinalVision } from "./ai";

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
      res.status(500).json({ message: "Failed to generate initial hypothesis", error: error.message });
    }
  });

  app.post('/api/ai/next-question', async (req, res) => {
    try {
      const { currentHypothesis, currentQuestion, userAnswer } = req.body;
      const result = await generateNextQuestion(currentHypothesis, currentQuestion, userAnswer);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error generating next question:", error);
      res.status(500).json({ message: "Failed to generate next question", error: error.message });
    }
  });

  app.post('/api/ai/final-vision', async (req, res) => {
    try {
      const { finalHypothesis } = req.body;
      const result = await generateFinalVision(finalHypothesis);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error generating final vision:", error);
      res.status(500).json({ message: "Failed to generate final vision", error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
