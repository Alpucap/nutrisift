import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { message, productContext } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are NutriSift AI, a helpful and empathetic food safety consultant.
        
        CONTEXT (PRODUCT ANALYSIS):
        ${JSON.stringify(productContext)}
        
        USER QUESTION:
        "${message}"
        
        INSTRUCTION:
        Answer the user's question specifically based on the product context provided above.
        - If the user asks about safety (pregnancy, diabetes, kids), check the ingredients list and sugar/sodium levels in the context.
        - Be concise, friendly, and helpful. 
        - Do not hallucinate ingredients that are not in the context.
        - If the question is irrelevant to the product, politely redirect to food safety topics.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        return NextResponse.json({ reply: response });

    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json(
        { error: "Maaf, saya sedang pusing. Coba tanya lagi." },
        { status: 500 }
        );
    }
}