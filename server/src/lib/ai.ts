import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateAIInsight(jobTitle: string, description: string, budget: number, deadline: any): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not found in .env, skipping AI Insight");
    return "";
  }

  let retries = 3;
  while (retries > 0) {
    try {
      console.log(`🤖 Gemini AI: Generating insight for "${jobTitle}"... (Retries left: ${retries})`);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : 'segera';
      const formattedBudget = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(budget);

      const prompt = `Kamu adalah asisten profesional UBeres. Berikan 1 kalimat insight singkat (maks 20 kata) untuk menarik minat pekerja.
Sertakan info tantangan kerja, budget (${formattedBudget}), dan deadline (${formattedDeadline}) dalam kalimat tersebut.

Judul: ${jobTitle}
Deskripsi: ${description}

Insight (1 kalimat):`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      if (text.startsWith("Insight:")) {
        text = text.replace("Insight:", "").trim();
      }

      console.log(`✅ Gemini Insight Generated: ${text}`);
      return text;
    } catch (error: any) {
      if (error?.status === 429) {
        console.warn("⚠️ Rate limited (429). Waiting 5s before retry...");
        await sleep(5000);
        retries--;
      } else {
        console.error("❌ Gemini AI Error:", error);
        return "";
      }
    }
  }
  return "";
}

export async function polishDescription(description: string): Promise<string> {
  if (!GEMINI_API_KEY || !description) return description;

  let retries = 2;
  while (retries > 0) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const prompt = `Kamu adalah editor profesional UBeres. 
Tugas kamu adalah memperbaiki (polish) deskripsi pekerjaan berikut agar lebih profesional, jelas, dan menarik bagi pekerja, namun tetap mempertahankan inti informasinya.
Gunakan Bahasa Indonesia yang santun namun efektif.

Deskripsi Asli: 
${description}

Hasil Polish (hanya berikan teks deskripsinya saja tanpa komentar tambahan):`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      if (error?.status === 429) {
        console.warn("⚠️ Rate limited (429) during polish. Waiting 3s...");
        await sleep(3000);
        retries--;
      } else {
        console.error("❌ Gemini Polish Error:", error);
        return description;
      }
    }
  }
  return description;
}
