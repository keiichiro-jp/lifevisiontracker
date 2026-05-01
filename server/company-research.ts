import OpenAI from "openai";

const MODEL = "gpt-4o";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development",
});

export async function researchCompany(companyName: string) {
  const prompt = `
あなたは企業調査の専門家です。「${companyName}」について、以下の情報を詳細に調査・分析してください。

調査対象ソース（知識ベースより）:
1. 公式コーポレートサイトの情報
2. 求人情報（Indeed、求人ボックス、リクナビNEXT等）から読み取れる組織・業務情報
3. IR資料・決算報告書
4. プレスリリース・ニュースリリース
5. LinkedInの企業ページ
6. 業界レポート・ニュース記事

以下のJSON形式で回答してください：

{
  "officialName": "正式な会社名",
  "industry": "業種・業界（例：IT・ソフトウェア、製造業、小売業など）",
  "summary": "会社の概要・事業内容の要約（300字程度）",
  "organizationStructure": {
    "name": "${companyName}",
    "type": "division",
    "description": "会社全体",
    "children": [
      {
        "name": "部門名（例：経営本部、事業本部）",
        "type": "division",
        "description": "この部門の役割・機能",
        "children": [
          {
            "name": "部署名（例：人事部、財務部）",
            "type": "department",
            "description": "この部署の主な業務内容",
            "children": []
          }
        ]
      }
    ]
  },
  "businessOperations": [
    {
      "id": "op001",
      "department": "所属部署名",
      "category": "業務カテゴリ（例：営業・販売、マーケティング、開発・エンジニアリング、人事・採用、財務・経理、法務・コンプライアンス、カスタマーサポート、経営企画、広報・PR、購買・調達、物流・サプライチェーン、品質管理）",
      "title": "業務名",
      "description": "業務の詳細説明（求人票ベースの実務内容を含む）",
      "sourceUrl": "参照ソースURL（実際のURLがある場合のみ、なければ空文字）"
    }
  ],
  "competitors": [
    {
      "name": "競合企業名1",
      "reason": "競合とみなす理由",
      "marketPosition": "市場ポジション"
    },
    {
      "name": "競合企業名2",
      "reason": "競合とみなす理由",
      "marketPosition": "市場ポジション"
    },
    {
      "name": "競合企業名3",
      "reason": "競合とみなす理由",
      "marketPosition": "市場ポジション"
    }
  ],
  "sources": [
    {
      "type": "公式サイト",
      "description": "参照した情報源の説明",
      "url": "URL（実際のURLがある場合のみ）"
    }
  ]
}

重要な指示:
- businessOperationsは最低20件以上、できるだけ網羅的に列挙すること
- organizationStructureは実際の組織階層（経営層→本部→部門→部署→チーム）を反映すること
- 求人情報から読み取れる職種・業務内容を積極的に反映すること
- 日本語で回答すること
- 不明な情報は「不明」と記載し、架空の情報は作成しないこと
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("AI response was empty");
  return JSON.parse(content);
}

export async function researchCompetitor(competitorName: string, originalCompany: string) {
  const prompt = `
あなたは企業調査の専門家です。「${competitorName}」（「${originalCompany}」の競合企業）について、詳細に調査・分析してください。

以下のJSON形式で回答してください：

{
  "officialName": "正式な会社名",
  "industry": "業種・業界",
  "summary": "会社の概要・事業内容の要約（300字程度）",
  "organizationStructure": {
    "name": "${competitorName}",
    "type": "division",
    "description": "会社全体",
    "children": [
      {
        "name": "部門名",
        "type": "division",
        "description": "この部門の役割",
        "children": [
          {
            "name": "部署名",
            "type": "department",
            "description": "この部署の業務内容",
            "children": []
          }
        ]
      }
    ]
  },
  "businessOperations": [
    {
      "id": "op001",
      "department": "所属部署名",
      "category": "業務カテゴリ",
      "title": "業務名",
      "description": "業務の詳細説明",
      "sourceUrl": ""
    }
  ],
  "competitors": [
    {
      "name": "${originalCompany}",
      "reason": "競合とみなす理由",
      "marketPosition": "市場ポジション"
    }
  ],
  "sources": []
}

重要な指示:
- businessOperationsは最低15件以上列挙すること
- 日本語で回答すること
- 不明な情報は「不明」と記載すること
`;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("AI response was empty");
  return JSON.parse(content);
}
