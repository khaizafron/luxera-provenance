import { GoogleGenAI } from '@google/genai';

export interface OCRResult {
  extractedText: string;
  ocrStatus: 'COMPLETED' | 'FAILED' | 'OCR_NOT_CONFIGURED';
  errorMessage?: string;
}

/**
 * Real OCR and Text Extraction Engine with dual redundancy:
 * 1. OCR.space API (if OCR_SPACE_API_KEY is configured)
 * 2. Google Gemini Vision OCR (if GEMINI_API_KEY is configured)
 * 3. Native Lightweight PDF parser (for text-based PDFs)
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<OCRResult> {
  const ocrSpaceKey = process.env.OCR_SPACE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Track processing attempts
  const logs: string[] = [];

  // --- ATTEMPT 1: OCR.space API ---
  if (ocrSpaceKey) {
    try {
      console.log(`[OCR] Initiating OCR.space parsing for: ${filename}`);
      const base64Data = buffer.toString('base64');
      const fileExt = filename.split('.').pop()?.toUpperCase() || 'PNG';
      const filetype = ['PDF', 'PNG', 'JPG', 'JPEG', 'GIF'].includes(fileExt) ? fileExt : 'PNG';

      const formData = new FormData();
      formData.append('apikey', ocrSpaceKey);
      formData.append('base64Image', `data:${mimeType};base64,${base64Data}`);
      formData.append('filetype', filetype);
      formData.append('scale', 'true');
      formData.append('isTable', 'true'); // Enhanced tabular data layout preservation

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds timeout

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OCR.space returned HTTP code ${response.status}`);
      }

      const data = await response.json();

      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage?.[0] || 'Unknown OCR.space processing error');
      }

      const parsedText = data.ParsedResults?.map((r: any) => r.ParsedText).join('\n') || '';
      if (parsedText.trim()) {
        console.log(`[OCR] OCR.space parsing completed successfully for ${filename}`);
        return {
          extractedText: parsedText.trim(),
          ocrStatus: 'COMPLETED',
        };
      } else {
        throw new Error('OCR.space returned empty text results.');
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      console.warn(`[OCR] OCR.space attempt failed: ${msg}. Proceeding to fallback.`);
      logs.push(`OCR.space failed: ${msg}`);
    }
  } else {
    logs.push('OCR.space not configured (OCR_SPACE_API_KEY missing)');
  }

  // --- ATTEMPT 2: Google Gemini Vision OCR ---
  if (geminiKey) {
    try {
      console.log(`[OCR] Falling back to Gemini Vision OCR for: ${filename}`);
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const base64Data = buffer.toString('base64');

      const prompt = `You are an OCR and Document Analysis engine for financial evidence.
Extract ALL readable text from this uploaded financial document (${filename}).
Include all headers, tables, transactions, names, account numbers, dates, and currency amounts.
Output strictly the raw extracted document text without conversational filler.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType || (filename.endsWith('.pdf') ? 'application/pdf' : 'image/png'),
              data: base64Data,
            },
          },
          prompt,
        ],
      });

      const text = response.text?.trim() || '';
      if (text) {
        console.log(`[OCR] Gemini Vision OCR completed successfully for ${filename}`);
        return {
          extractedText: text,
          ocrStatus: 'COMPLETED',
        };
      } else {
        throw new Error('Gemini Vision returned empty text output.');
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      console.error(`[OCR] Gemini Vision OCR failed: ${msg}`);
      logs.push(`Gemini OCR failed: ${msg}`);
    }
  } else {
    logs.push('Gemini Vision OCR not configured (GEMINI_API_KEY missing)');
  }

  // --- ATTEMPT 3: Native Lightweight PDF Stream Parser (Offline Fallback) ---
  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    try {
      console.log(`[OCR] Running offline PDF text stream parser for: ${filename}`);
      const pdfText = parseBasicPdfText(buffer);
      if (pdfText && pdfText.length > 20) {
        console.log(`[OCR] Offline PDF stream parsing succeeded for ${filename}`);
        return {
          extractedText: pdfText,
          ocrStatus: 'COMPLETED',
        };
      } else {
        throw new Error('Offline stream parsing produced insufficient characters.');
      }
    } catch (err: any) {
      const msg = err.message || String(err);
      console.error(`[OCR] Offline PDF stream parsing failed: ${msg}`);
      logs.push(`Offline stream parser failed: ${msg}`);
    }
  }

  // If all attempts failed
  const isConfigured = !!(ocrSpaceKey || geminiKey);
  return {
    extractedText: '',
    ocrStatus: isConfigured ? 'FAILED' : 'OCR_NOT_CONFIGURED',
    errorMessage: isConfigured
      ? `OCR Extraction failed. Details: ${logs.join(' | ')}`
      : 'OCR services not configured. Set GEMINI_API_KEY or OCR_SPACE_API_KEY to enable text extraction.',
  };
}

/**
 * Lightweight PDF text stream extractor for text-based PDFs without external dependencies
 */
function parseBasicPdfText(buffer: Buffer): string {
  try {
    const content = buffer.toString('utf-8');
    const textMatches: string[] = [];

    const streamRegex = /BT[\s\S]*?ET/g;
    let match;
    while ((match = streamRegex.exec(content)) !== null) {
      const block = match[0];
      const tjRegex = /\(([^)]+)\)\s*T[jJ]/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        if (tjMatch[1]) textMatches.push(tjMatch[1]);
      }
    }

    return textMatches.join(' ').replace(/\\/g, '');
  } catch {
    return '';
  }
}
