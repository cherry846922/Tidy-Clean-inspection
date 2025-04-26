import OpenAI from "openai";

// Initialize OpenAI client with API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Optimization categories
export const OPTIMIZATION_CATEGORIES = [
  "guest experience",
  "maintenance",
  "amenities",
  "efficiency",
  "sustainability",
  "safety",
  "aesthetics"
];

export interface OptimizationSuggestion {
  category: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  costEstimate: string; // e.g. "$50-100", "Less than $20"
  timeframe: string; // e.g. "1-2 days", "Less than 1 hour"
  benefits: string[];
}

// Main function to generate property optimization suggestions
export async function generatePropertyOptimizations(
  propertyData: any,
  inspectionHistory: any[],
  categoryFocus?: string
): Promise<OptimizationSuggestion[]> {
  try {
    // Prepare the input data for the AI
    const promptData = {
      property: propertyData,
      inspections: inspectionHistory,
      focusCategory: categoryFocus || "all"
    };
    
    // Convert to JSON string for the prompt
    const promptDataString = JSON.stringify(promptData, null, 2);
    
    // Create system prompt with instructions
    const systemPrompt = `You are an expert property optimization assistant for Airbnb hosts.
Your task is to analyze property data and inspection history to generate actionable optimization suggestions.
Focus on practical, high-value improvements that will enhance guest experience, increase efficiency, or address maintenance issues.
${categoryFocus ? `Prioritize suggestions in the "${categoryFocus}" category.` : ""}

For each suggestion, include:
1. A clear title (under 10 words)
2. A category (from: ${OPTIMIZATION_CATEGORIES.join(", ")})
3. A detailed description (2-3 sentences)
4. Impact level (high/medium/low)
5. Effort level (high/medium/low)
6. Estimated cost range
7. Implementation timeframe
8. 2-3 specific benefits

IMPORTANT: Return your response as a valid JSON array where each object has these properties:
- category: string (one of the predefined categories)
- title: string
- description: string
- impact: "high" | "medium" | "low"
- effort: "high" | "medium" | "low"
- costEstimate: string
- timeframe: string
- benefits: string[] (array of 2-3 benefit strings)

Provide 3-5 high-quality suggestions based on the property data and inspection history.`;

    // Create the user prompt with data
    const userPrompt = `Please generate optimization suggestions for this property data and inspection history:
    
${promptDataString}`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse and return the response
    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from AI");
    }

    const parsedResponse = JSON.parse(responseContent);
    
    // Return the suggestions array from the JSON response
    return parsedResponse.suggestions || [];
    
  } catch (error: any) {
    console.error("Error generating property optimizations:", error);
    
    // Check for quota exceeded error
    if (error.type === 'insufficient_quota' || 
        (error.message && error.message.includes('quota')) || 
        error.status === 429 ||
        (error.error && error.error.type === 'insufficient_quota')) {
      // Return mock data for demonstration purposes when quota is exceeded
      return [
        {
          category: "guest experience",
          title: "Smart Home Controls Integration (Demo)",
          description: "This is a demonstration suggestion since the OpenAI API quota has been exceeded. In a real scenario, AI would generate personalized suggestions for your property.",
          impact: "high",
          effort: "medium",
          costEstimate: "$200-500",
          timeframe: "1-2 weeks",
          benefits: [
            "Improves guest satisfaction with modern amenities",
            "Allows convenient control of lighting and temperature",
            "Sets your property apart from competitors"
          ]
        },
        {
          category: "maintenance",
          title: "Preventative HVAC Maintenance Schedule (Demo)",
          description: "Sample suggestion shown because OpenAI API quota is exceeded. Regular maintenance can prevent costly emergency repairs and guest complaints.",
          impact: "medium",
          effort: "low",
          costEstimate: "$100-300/year",
          timeframe: "Ongoing, quarterly",
          benefits: [
            "Prevents emergency breakdowns during guest stays",
            "Extends the life of expensive equipment",
            "Improves energy efficiency and reduces costs"
          ]
        }
      ];
    } else {
      throw new Error(`Failed to generate optimization suggestions: ${error.message || 'Unknown error'}`);
    }
  }
}

// Function to generate a quick summary of a property's main improvement areas
export async function generatePropertyImprovementSummary(
  propertyData: any,
  inspectionHistory: any[]
): Promise<string> {
  try {
    // Prepare the input data
    const promptData = {
      property: propertyData,
      inspections: inspectionHistory
    };
    
    // System prompt for summary generation
    const systemPrompt = `Provide a brief summary (under 100 words) of the main areas where this property could be improved, 
    based on the data and inspection history provided. Focus on the 2-3 most important aspects that would have the biggest positive impact.`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(promptData, null, 2) },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    return response.choices[0].message.content || "Unable to generate summary.";
    
  } catch (error: any) {
    console.error("Error generating improvement summary:", error);
    
    // Check for quota exceeded error
    if (error.type === 'insufficient_quota' || 
        (error.message && error.message.includes('quota')) || 
        error.status === 429 ||
        (error.error && error.error.type === 'insufficient_quota')) {
      // Return fallback summary for demo purposes
      return "DEMO MODE: This property could benefit from improved guest amenities and regular maintenance scheduling. Since the OpenAI API quota is exceeded, this is a demonstration summary. With an active API key, you would see personalized AI-generated optimization suggestions.";
    } else {
      return "Unable to generate property improvement summary at this time.";
    }
  }
}