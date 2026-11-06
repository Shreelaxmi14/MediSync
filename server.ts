import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Server-side AI endpoint for adherence summary
app.post('/api/ai/adherence-summary', async (req, res) => {
  try {
    const { patientName, adherenceRate, slotsData, medicinesData, missedReasons } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback rule-based summary when GEMINI_API_KEY is not configured
      const lowestSlot = slotsData?.sort((a: any, b: any) => a.rate - b.rate)[0];
      const highestSlot = slotsData?.sort((a: any, b: any) => b.rate - a.rate)[0];

      return res.json({
        success: true,
        summary: `${patientName || 'The patient'} maintains an overall medication adherence rate of ${adherenceRate}%. Routines are strongest during the ${highestSlot?.name || 'morning'} (${highestSlot?.rate || 90}%), while the ${lowestSlot?.name || 'evening'} routine experiences the most missed or delayed confirmations (${lowestSlot?.rate || 65}%).`,
        patterns: [
          `Morning consistency remains stable, supported by breakfast meal routine.`,
          `${lowestSlot?.name || 'Evening'} doses drop during late hours, primarily due to schedule disruptions.`,
          missedReasons?.length > 0 ? `Primary patient-reported factor: ${missedReasons[0].reason} (${missedReasons[0].count} times).` : `Doses are occasionally unconfirmed past the 2-hour window.`
        ],
        recommendations: [
          `Adjust evening reminder times 30 minutes earlier to coincide with dinner.`,
          `Consider pill organizer alignment with the Care Rhythm schedule.`,
          `Review notifications settings to enable a gentle secondary chime for unconfirmed doses.`
        ],
        source: 'rule-engine'
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a supportive clinical pharmacist and medication adherence specialist assisting MediSync platform users.
Analyze the following patient adherence data and generate an empathetic, actionable adherence summary and 3 practical recommendations.
IMPORTANT:
- Do NOT provide medical diagnoses, treatment changes, or dosage modifications.
- Focus strictly on behavioral routine, timing habits, and reminder synchronization.
- Keep the tone encouraging, respectful, and clear.

Data:
- Patient Name: ${patientName || 'Patient'}
- Adherence Rate: ${adherenceRate}%
- Routine Slots: ${JSON.stringify(slotsData)}
- Medications: ${JSON.stringify(medicinesData)}
- Recorded Missed Reasons: ${JSON.stringify(missedReasons)}

Format your response as a strict JSON object with these keys:
{
  "summary": "1-2 paragraphs of supportive adherence overview highlighting strengths and specific routine challenges",
  "patterns": ["pattern 1", "pattern 2", "pattern 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        summary: text,
        patterns: ["Morning routine shows high regularity", "Evening reminders need alignment"],
        recommendations: ["Synchronize evening doses with dinner", "Enable caregiver notification alerts"]
      };
    }

    return res.json({
      success: true,
      ...parsed,
      source: 'gemini-3.8-flash'
    });
  } catch (error: any) {
    console.error('Error generating AI adherence summary:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate adherence summary'
    });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediSync server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
