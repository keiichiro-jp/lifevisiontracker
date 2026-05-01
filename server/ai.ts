import OpenAI from "openai";
import type { Department, BusinessActivity, Competitor, AIAgentSuggestion } from "@shared/schema";

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
