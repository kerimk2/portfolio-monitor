import { GoogleGenerativeAI } from '@google/generative-ai';
import { FMPTickerData, AIAnalysis } from '@/types/watchlist';

export async function analyzeWithClaude(
  ticker: string,
  data: FMPTickerData
): Promise<AIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const formatNum = (n: number) => {
    if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n === 0) return 'N/A';
    return `$${n.toLocaleString()}`;
  };

  const prompt = `You are a senior financial analyst. Analyze the stock ${ticker} (${data.companyName}) and provide your assessment.

Available real-time data:
- Sector: ${data.sector} | Industry: ${data.industry}
- Current Price: $${data.price.toFixed(2)}
- Market Cap: ${formatNum(data.mktCap)}
- YTD Performance: ${data.ytdChange.toFixed(2)}%
- 1-Year Performance: ${data.oneYearChange.toFixed(2)}%

Company description: ${data.description.slice(0, 500)}

Using the above data AND your knowledge of this company's financials, competitive position, and industry dynamics, provide:

1. "revenue" - your best estimate of annual revenue (number in dollars, 0 if unknown)
2. "netIncome" - your best estimate of annual net income (number in dollars, 0 if unknown)
3. "eps" - your best estimate of EPS (number, 0 if unknown)
4. "peRatio" - your best estimate of P/E ratio (number, 0 if unknown)
5. "pbRatio" - your best estimate of P/B ratio (number, 0 if unknown)
6. "evEbitda" - your best estimate of EV/EBITDA (number, 0 if unknown)
7. "risks" - exactly 3 key risks (one concise sentence each)
8. "strengths" - exactly 3 key strengths (one concise sentence each)
9. "evaluation" - a 2-3 sentence evaluation on whether this stock warrants further research

Respond ONLY with valid JSON, no markdown or explanation:
{"revenue":0,"netIncome":0,"eps":0,"peRatio":0,"pbRatio":0,"evEbitda":0,"risks":["...","...","..."],"strengths":["...","...","..."],"evaluation":"..."}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 3) : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
      evaluation: parsed.evaluation || 'Analysis unavailable.',
      revenue: parsed.revenue || 0,
      netIncome: parsed.netIncome || 0,
      eps: parsed.eps || 0,
      peRatio: parsed.peRatio || 0,
      pbRatio: parsed.pbRatio || 0,
      evEbitda: parsed.evEbitda || 0,
    };
  } catch {
    return {
      risks: ['Analysis parsing failed'],
      strengths: ['Analysis parsing failed'],
      evaluation: 'Could not generate AI analysis.',
      revenue: 0,
      netIncome: 0,
      eps: 0,
      peRatio: 0,
      pbRatio: 0,
      evEbitda: 0,
    };
  }
}
