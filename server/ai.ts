import OpenAI from "openai";
import type { Department, BusinessActivity, Competitor, AIAgentSuggestion } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development"
});

export async function researchCompany(companyName: string) {
  const prompt = `
あなたは企業調査の専門家AIです。「${companyName}」について、以下の情報ソースを参考にして包括的な調査を行ってください。

参考にするソース：
1. 公式コーポレートサイト（企業概要、事業内容、組織情報）
2. 求人情報（Indeed、求人ボックス、リクナビNEXT、マイナビ転職、LinkedIn、Wantedly等）
3. IR・決算資料（有価証券報告書、決算説明資料、統合レポート）
4. プレスリリース・ニュースリリース
5. OpenWork・Glassdoor・ビズリーチ等の口コミ・業界メディア
6. LinkedInおよびその他企業情報サービス

以下の構造化されたJSONを返してください。全て日本語で回答してください：

{
  "industryTag": "業界・業種を表す短いタグ（例：ITサービス・総合電機メーカー・システムインテグレーター）",
  "summary": "企業の概要説明（300字程度）",
  "organizationStructure": {
    "name": "会社名（正式名称）",
    "description": "会社全体の説明",
    "subDepartments": [
      {
        "name": "部門名（例：パブリックビジネス部門）",
        "description": "部門の役割・担当領域",
        "roles": ["部門長", "マネージャー", "主要な職種名"],
        "subDepartments": [
          {
            "name": "部署名（例：公共システム部）",
            "description": "部署の役割",
            "roles": ["役職名1", "役職名2"]
          }
        ]
      }
    ]
  },
  "businessActivities": [
    {
      "name": "業務名",
      "department": "担当部署",
      "description": "業務の詳細説明（求人情報も参考に具体的に記述）",
      "sourceUrl": "参照した想定URL",
      "sourceType": "official_site | job_posting | ir_document | press_release | linkedin | news | other"
    }
  ],
  "aiAgentSuggestions": [
    {
      "name": "AIエージェント活用提案のタイトル",
      "description": "この企業の業務・組織に特化した具体的なAIエージェント活用方法の説明（100〜150字）",
      "priority": "high | medium | low",
      "department": "主な対象部署"
    }
  ],
  "competitors": [
    {
      "name": "競合企業名（正式名称）",
      "reason": "競合と判断した具体的な理由",
      "industry": "業界・分野"
    }
  ],
  "sources": [
    {
      "type": "ソース種別の日本語表記",
      "description": "参照した情報源の説明",
      "url": "想定URL"
    }
  ]
}

重要：
- organizationStructureはこの企業の実際の組織を反映し、5〜10の主要部門を含めてください
- businessActivitiesは求人情報も参考に網羅的にリストアップしてください（最低20件）
- aiAgentSuggestionsはこの企業の業種・業務・組織に具体的に特化した提案を4〜6件（priorityはhigh/medium/lowで分類）
- competitorsは上位3社を選定し具体的な競合理由を記載してください
- sourcesには実際に参照したと想定されるソース名・URLを6〜8件含めてください
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("OpenAI response was empty");

  const data = JSON.parse(content);
  return {
    industryTag: data.industryTag as string,
    summary: data.summary as string,
    organizationStructure: data.organizationStructure as Department,
    businessActivities: data.businessActivities as BusinessActivity[],
    aiAgentSuggestions: data.aiAgentSuggestions as AIAgentSuggestion[],
    competitors: data.competitors as Competitor[],
    sources: data.sources as { type: string; description: string; url: string }[],
  };
}

export async function generateInitialHypothesis(userData: any) {
  try {
    const prompt = `
You are an AI assistant specializing in life vision planning and personal development.

User's basic information:
${JSON.stringify(userData, null, 2)}

Based on this information:
1) Create a hypothesis about the user's potential values, interests, and challenges.
2) Generate ONE follow-up question to help understand the user better.
3) The question MUST be multiple-choice with 4-6 specific options (never use free text input).
4) Make options concrete and specific to the user's context, avoid generic options.

Format the response as a JSON object with the following structure:
{
  "hypothesis": {
    "values": ["list of potential values"],
    "interests": ["list of potential interests"],
    "challenges": ["list of potential challenges"],
    "goals": ["list of potential goals"]
  },
  "question": {
    "id": "unique question identifier",
    "text": "the question text",
    "selectionType": "single" or "multiple", 
    "options": ["4-6 specific multiple choice options"]
  }
}

Note: Always use "single" or "multiple" for selectionType. Never use "text" as we want all questions to be multiple choice.
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI response was empty");
    }
    const parsedResponse = JSON.parse(content);
    
    return {
      hypothesis: parsedResponse.hypothesis,
      question: parsedResponse.question.text,
      questionData: parsedResponse.question
    };
  } catch (error) {
    console.error("Error generating initial hypothesis:", error);
    throw new Error("Failed to generate initial analysis");
  }
}

export async function generateNextQuestion(currentHypothesis: any, currentQuestion: string, userAnswer: string | string[]) {
  try {
    const prompt = `
You are an AI assistant specializing in life vision planning and personal development.

Current understanding about the user:
${JSON.stringify(currentHypothesis, null, 2)}

The user was asked: "${currentQuestion}"
The user's answer: ${typeof userAnswer === 'string' ? `"${userAnswer}"` : JSON.stringify(userAnswer)}

Based on this information:
1) Update the hypothesis about the user.
2) Generate ONE new follow-up question to further understand the user.
3) The question MUST be multiple-choice with 4-6 specific options (never use free text input).
4) Make options concrete and specific to the user's context, avoiding generic options.
5) If you have gathered sufficient information (after approximately 10 questions), set questionComplete to true.

Format the response as a JSON object with the following structure:
{
  "hypothesis": {
    "values": ["updated list of values"],
    "interests": ["updated list of interests"],
    "challenges": ["updated list of challenges"],
    "goals": ["updated list of goals"]
  },
  "question": {
    "id": "unique question identifier",
    "text": "the question text",
    "selectionType": "single" or "multiple",
    "options": ["4-6 specific multiple choice options"]
  },
  "questionComplete": false
}

Note: Always use "single" or "multiple" for selectionType. Never use "text" as we want all questions to be multiple choice.
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI response was empty");
    }
    const parsedResponse = JSON.parse(content);
    
    return {
      hypothesis: parsedResponse.hypothesis,
      question: parsedResponse.questionComplete ? "" : parsedResponse.question.text,
      questionData: parsedResponse.questionComplete ? null : parsedResponse.question,
      questionComplete: parsedResponse.questionComplete
    };
  } catch (error) {
    console.error("Error generating next question:", error);
    throw new Error("Failed to generate next question");
  }
}

export async function generateFinalVision(finalHypothesis: any) {
  try {
    const prompt = `
You are an AI assistant specializing in life vision planning and personal development.

Final understanding about the user:
${JSON.stringify(finalHypothesis, null, 2)}

Based on this comprehensive understanding:
1) Generate a personalized life vision for the user.
2) Create three distinct vision statements in different life categories.
3) Each vision should be actionable, inspiring, and aligned with the user's values and goals.

Format the response as a JSON object with the following structure:
{
  "keyMessage": "A concise, motivational summary of the overall life vision",
  "visions": [
    {
      "category": "Career & Purpose",
      "title": "Title for this vision category",
      "color": "primary", 
      "content": "Detailed vision statement for this category..."
    },
    {
      "category": "Financial Freedom",
      "title": "Title for this vision category",
      "color": "secondary",
      "content": "Detailed vision statement for this category..."
    },
    {
      "category": "Personal Growth",
      "title": "Title for this vision category",
      "color": "accent",
      "content": "Detailed vision statement for this category..."
    }
  ]
}

Notes on colors:
- Use "primary" for the main vision category
- Use "secondary" for the second vision category
- Use "accent" for the third vision category
`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI response was empty");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating final vision:", error);
    throw new Error("Failed to generate life vision");
  }
}