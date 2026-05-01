import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { researchCompany } from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post('/api/company-research', async (req, res) => {
    try {
      const { companyName } = req.body;
      if (!companyName || typeof companyName !== 'string') {
        return res.status(400).json({ message: "companyName is required" });
      }

      const result = await researchCompany(companyName.trim());

      const record = await storage.createCompanyResearch({
        companyName: companyName.trim(),
        industryTag: result.industryTag ?? null,
        organizationStructure: result.organizationStructure as any,
        businessActivities: result.businessActivities as any,
        aiAgentSuggestions: result.aiAgentSuggestions as any ?? null,
        competitors: result.competitors as any,
        summary: result.summary,
        sources: result.sources as any,
      });

      res.status(201).json(record);
    } catch (error) {
      console.error("Error researching company:", error);
      res.status(500).json({
        message: "Failed to research company",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get('/api/company-research', async (req, res) => {
    try {
      const history = await storage.getCompanyResearchHistory();
      res.status(200).json(history);
    } catch (error) {
      console.error("Error fetching research history:", error);
      res.status(500).json({ message: "Failed to fetch research history" });
    }
  });

  app.get('/api/company-research/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const record = await storage.getCompanyResearchById(id);
      if (!record) {
        return res.status(404).json({ message: "Research record not found" });
      }
      res.status(200).json(record);
    } catch (error) {
      console.error("Error fetching research record:", error);
      res.status(500).json({ message: "Failed to fetch research record" });
    }
  });

  app.delete('/api/company-research/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCompanyResearch(id);
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Error deleting research record:", error);
      res.status(500).json({ message: "Failed to delete research record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
