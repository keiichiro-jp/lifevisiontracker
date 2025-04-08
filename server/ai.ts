import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development"
});

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