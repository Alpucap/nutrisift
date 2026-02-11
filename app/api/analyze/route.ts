import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const MODEL_NAME = "gemini-2.5-flash"; 
const TEMPERATURE_STRICT = 0.0; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface Alert {
    name: string;
    category: "Health" | "Halal" | "Allergy";
    risk: string;
    severity: "Low" | "Medium" | "High";
}

interface AnalysisResponse {
    _agent_reasoning: {
        ocr_agent: string;
        halal_agent: string;
        health_agent: string;
        final_verdict: string;
    };
    product_name: string;
    detected_ingredients_text: string;
    health_score: number;
    halal_analysis: {
        status: "Halal Safe" | "Syubhat (Doubtful)" | "Non-Halal";
        reason: string;
    };
    allergen_list: string[];
    nutrition_summary: {
        sugar_g: number;
        sugar_teaspoons: number;
    };
    alerts: Alert[];
    healthy_alternatives: {
        name: string;
        reason: string;
    }[];
    brief_conclusion: string;
}

function extractAndParseJSON(rawText: string) {
    try {
        return JSON.parse(rawText);
    } catch {
        const match = rawText.match(/```json([\s\S]*?)```/);
        if (match) {
        return JSON.parse(match[1]);
        }
        const firstOpen = rawText.indexOf('{');
        const lastClose = rawText.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1) {
        return JSON.parse(rawText.substring(firstOpen, lastClose + 1));
        }
        throw new Error("Deep Learning Model output malformed JSON.");
    }
}

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) return NextResponse.json({ error: "No input tensor detected" }, { status: 400 });

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `
        SYSTEM: ACTIVATE MULTI-AGENT MIXTURE OF EXPERTS (MoE) PROTOCOL.
        TARGET: FOOD SAFETY & HALAL FORENSICS (INDONESIA REGION).

        --- PHASE 1: KNOWLEDGE INJECTION (READ-ONLY MEMORY) ---
        [HALAL DATABASE - MUI FATWA 33/2011]
        - E120 (Karmin/Cochineal): STATUS = HALAL.
        - Ethanol: HALAL if <0.5% & non-intoxicating industry.
        - Rum/Mirin/Wine: STATUS = HARAM.
        - E471/Gelatin/L-Cysteine: STATUS = SYUBHAT (Requires 'Bovine'/'Plant' descriptor or Halal Logo).
        
        [NUTRITION VECTORS]
        - SUGAR_RISK_THRESHOLD: >22.5g/100g.
        - ANOMALY_DETECTION_RULE: IF ingredients=["Sugar","Syrup","Cane","Choco"] AND nutrition_sugar=0 THEN FLAG_ERROR="TRUE".

        --- PHASE 2: AGENT EXECUTION TASKS ---
        You must emulate the following agents sequentially:

        🕵️ [AGENT A: VISUAL EXTRACTOR]
        - Perform OCR on the image. Handle curvature, glare, and blurry text.
        - Detect "Halal Indonesia" or "MUI" logos.
        - Output: Raw Text & Visual Tags.

        🔬 [AGENT B: SHARIA AUDITOR]
        - Input: Agent A's text.
        - Logic: Match ingredients against [HALAL DATABASE].
        - Override: If Agent A found a Halal Logo, all 'SYUBHAT' ingredients become 'HALAL SAFE'.

        🩺 [AGENT C: NUTRITIONIST]
        - Input: Agent A's text.
        - Logic: Calculate Sugar metrics. 
        - Task: Generate "Smart Swaps" (Generic healthy alternatives). 
        Example: If "Potato Chips" -> Suggest "Baked Veggie Chips" or "Air-Popped Popcorn".

        ⚖️ [AGENT D: THE JUDGE (META-REASONING)]
        - Compare findings from A, B, and C.
        - DETECT ANOMALIES: Does the text say "Chocolate" but Agent C says "0g Sugar"? If yes, issue a CRITICAL WARNING.
        - Finalize the Safety Score (0-100).

        --- PHASE 3: FINAL OUTPUT TENSOR (JSON ONLY) ---
        Return ONLY this JSON structure. No preamble.

        {
        "meta_agent_logs": {
            "visual_agent": "string (What Agent A saw)",
            "audit_agent": "string (Agent B's reasoning regarding E120/Pork/etc)",
            "anomaly_check": "string (Agent D's verdict on data consistency)"
        },
        "product_name": "string",
        "detected_ingredients_text": "string",
        "health_score": number,
        "halal_analysis": {
            "status": "Halal Safe" | "Syubhat (Doubtful)" | "Non-Halal",
            "reason": "string"
        },
        "allergen_list": ["string"],
        "nutrition_summary": {
            "sugar_g": number,
            "sugar_teaspoons": number
        },
        "alerts": [
            { "name": "string", "category": "Health"|"Halal"|"Allergy", "risk": "string", "severity": "High"|"Medium"|"Low" }
        ],
        "healthy_alternatives": [
            { "name": "string", "reason": "string" }
        ],
        "brief_conclusion": "string"
        }
        `;

        const base64Data = image.includes("base64,") ? image.split(",")[1] : image;
        
        const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { data: base64Data, mimeType: "image/jpeg" } }] }],
        generationConfig: {
            temperature: TEMPERATURE_STRICT,
            maxOutputTokens: 8192,
        },
        });

        const responseText = result.response.text();
        const data: AnalysisResponse = extractAndParseJSON(responseText);
        
        const sugarKeywords = ["sugar", "gula", "syrup", "sirup", "chocolate", "coklat", "candy", "permen", "sweet"];
        const textLower = (data.detected_ingredients_text + data.product_name).toLowerCase();
        
        if (data.nutrition_summary.sugar_g === 0) {
        const suspicious = sugarKeywords.some(k => textLower.includes(k));
        if (suspicious) {
            data.health_score = Math.min(data.health_score, 30);
            data.brief_conclusion = "CRITICAL WARNING: Data Mismatch. Product likely contains sugar despite 0g reading.";
            data.alerts.unshift({
            name: "Anomaly Detected",
            category: "Health",
            risk: "AI detected 0g sugar but ingredients suggest otherwise. Verify physical label.",
            severity: "High"
            });
        }
        }

        if (data.halal_analysis.status === "Non-Halal" && data.health_score > 50) {
        data.health_score = 50; 
        }

        return NextResponse.json(data);

    } catch (error: unknown) {
        console.error("SYSTEM FAILURE:", error);
        
        let errorMessage = "Neural Network Error";
        if (error instanceof Error) {
            if (error.message.includes("404")) {
                errorMessage = "Model Gemini not found. Check API Key.";
            } else {
                errorMessage = "Failed to process visual data. Ensure image clarity.";
            }
        }

        return NextResponse.json(
        { 
            error: errorMessage, 
            details: error instanceof Error ? error.message : String(error)
        }, 
        { status: 500 }
        );
    }
}