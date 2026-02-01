import { GoogleGenerativeAI, Tool } from "@google/generative-ai";
import { NextResponse } from "next/server";

type ExtendedTool = Tool & {
    googleSearch?: object;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", 
            tools: [{ googleSearch: {} } as ExtendedTool],
        });

        const generationConfig = {
            temperature: 0.2, 
            maxOutputTokens: 3000, 
        };

        const prompt = `
        You are NutriSift AI, a comprehensive Food Safety Expert.
        
        TASK:
        Analyze the food packaging image extensively.
        
        STEPS:
        1. OCR: Read the full ingredient list and nutrition facts accurately.
        2. HALAL CHECK: Identify non-halal ingredients (Pork, Alcohol, Rum, Mirin) and doubtful E-codes (E120, E471, E441). Use Google Search to verify sources.
        3. ALLERGY CHECK: Identify common allergens (Peanuts, Dairy, Soy, Gluten, Shellfish, etc).
        4. HEALTH CHECK: Evaluate sugar, sodium, and dangerous preservatives.
        
        CRITICAL INSTRUCTION:
        Output ONLY a valid JSON object.
        
        JSON SCHEMA:
        {
            "product_name": "string",
            "detected_ingredients_text": "string (The full raw text of ingredients you read from the image)",
            "health_score": number (0-100),
            
            "halal_analysis": {
                "status": "Halal Safe" | "Syubhat (Doubtful)" | "Non-Halal",
                "reason": "string (Why? e.g. 'Contains Pork' or 'E471 might be animal-derived')"
            },
            
            "allergen_list": ["string (List of allergens found, e.g. 'Milk', 'Soy')"],
            
            "nutrition_summary": {
                "sugar_g": number,
                "sugar_teaspoons": number
            },
            
            "alerts": [
                { 
                    "name": "string (Ingredient Name)", 
                    "category": "Health" | "Halal" | "Allergy", 
                    "risk": "string (Explanation)",
                    "severity": "Low" | "Medium" | "High"
                }
            ],
            
            "brief_conclusion": "string (A holistic summary considering health, halal, and allergies)"
        }
        `;

        const base64Data = image.split(",")[1] || image;
        
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
            generationConfig,
        });

        const { response } = result;
        const rawText = response.text();
        console.log("Raw AI Response:", rawText); 

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("No JSON found in response");
        }

        const cleanJson = jsonMatch[0];
        const parsedData = JSON.parse(cleanJson);

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json(
            { error: "Failed to process data. Please try again." },
            { status: 500 }
        );
    }
}

