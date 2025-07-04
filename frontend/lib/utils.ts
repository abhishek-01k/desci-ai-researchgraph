import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeArrayField(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(item => item !== '');
  }
  
  if (typeof value === 'string') {
    if (value === '') {
      return [];
    }
    
    if (value.includes(',')) {
      return value.split(',').map(item => item.trim()).filter(item => item !== '');
    }
    
    if (value.includes('|')) {
      return value.split('|').map(item => item.trim()).filter(item => item !== '');
    }
    
    if (value.includes('\n') || value.includes('\\n')) {
      const normalized = value.replace(/\\n/g, '\n');
      return normalized.split('\n').map(item => item.trim()).filter(item => item !== '');
    }
    
    if (value.match(/\d+\.\s/)) {
      const numberedInstructions = value
        .split(/\d+\.\s/)
        .map(s => s.trim())
        .filter(s => s !== '');
      
      return numberedInstructions.filter((_, i) => 
        i > 0 || numberedInstructions[0].length > 0);
    }

    return [value.trim()];
  }
  
  return [];
}

export function hasValidData(value: any): boolean {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || 
        trimmed === 'null' || 
        trimmed === 'undefined' ||
        trimmed.toLowerCase().includes('no information') ||
        trimmed.toLowerCase().includes('not available') ||
        trimmed.toLowerCase().includes('not found')) {
      return false;
    }
    return true;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return false;
    
    const validItems = value.filter(item => {
      if (item === null || item === undefined) return false;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        return trimmed !== '' && 
               trimmed !== 'null' && 
               trimmed !== 'undefined' &&
               !trimmed.toLowerCase().includes('no information') &&
               !trimmed.toLowerCase().includes('not available') &&
               !trimmed.toLowerCase().includes('not found');
      }
      return true;
    });
    
    return validItems.length > 0;
  }
  
  return true;
}

function robustJsonCleaner(jsonStr: string): string {
  let preprocessed = jsonStr
    .replace(/\\'/g, "'")
    .replace(/\\\./g, ".");
  
  let result = '';
  let insideString = false;
  let escapeNext = false;
  
  for (let i = 0; i < preprocessed.length; i++) {
    const char = preprocessed[i];
    const charCode = char.charCodeAt(0);
    
    if (escapeNext) {
      if (char === 'n') {
        result += '\\n';
      } else if (char === 'r') {
        result += '\\r';
      } else if (char === 't') {
        result += '\\t';
      } else if (char === '"') {
        result += '\\"';
      } else if (char === '\\') {
        result += '\\\\';
      } else if (char === '/') {
        result += '\\/';
      } else if (char === "'") {
        result += "'";
      } else {
        result += '\\' + char;
      }
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      insideString = !insideString;
      result += char;
      continue;
    }
    
    if (insideString) {
      if (charCode < 32 || (charCode >= 127 && charCode < 160)) {
        result += ' ';
      } else if (char === "'") {
        result += char;
      } else if (char === "`") {
        result += "'";
      } else {
        result += char;
      }
    } else {
      if (charCode < 32 || (charCode >= 127 && charCode < 160)) {
        if (result.length > 0 && result[result.length - 1] !== ' ') {
          result += ' ';
        }
      } else {
        result += char;
      }
    }
  }
  
  result = normalizeJsonWhitespace(result);
  
  result = result
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/([}\]])(\s*)([^,\s}\]"])/g, '$1,$2$3');
  
  return result;
}

function normalizeJsonWhitespace(jsonStr: string): string {
  let result = '';
  let insideString = false;
  let escapeNext = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && !escapeNext) {
      insideString = !insideString;
      result += char;
      continue;
    }
    
    if (insideString) {
      result += char;
    } else {
      if (/\s/.test(char)) {
        if (result.length > 0 && !/\s/.test(result[result.length - 1])) {
          result += ' ';
        }
      } else {
        result += char;
      }
    }
  }
  
  return result.trim();
}

function validateJson(jsonStr: string): { valid: boolean; error?: string; position?: number; context?: string } {
  try {
    JSON.parse(jsonStr);
    return { valid: true };
  } catch (e) {
    if (e instanceof SyntaxError) {
      let position = -1;
      const posMatch = e.message.match(/position (\d+)/i) || e.message.match(/at position (\d+)/i);
      if (posMatch) {
        position = parseInt(posMatch[1]);
      }
      
      let context = '';
      if (position > -1) {
        const start = Math.max(0, position - 20);
        const end = Math.min(jsonStr.length, position + 20);
        context = jsonStr.substring(start, end);
      }
      
      return {
        valid: false,
        error: e.message,
        position,
        context
      };
    }
    return { valid: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export function cleanAndParseLLMResponse(llmResponse: any): any {
  let responseData = llmResponse;

  if (llmResponse && typeof llmResponse.response === 'string') {
    try {
      let cleanedResponse = robustJsonCleaner(llmResponse.response);
      
      const validation = validateJson(cleanedResponse);
      if (!validation.valid) {
        console.warn('Initial cleaning validation failed:', validation.error);
        if (validation.context) {
          console.warn('Context around error:', JSON.stringify(validation.context));
        }
      }
      
      cleanedResponse = cleanedResponse.replace(
        /"DOI":\s*([^,}]+)/g,
        (_match: string, doiValue: string) => {
          const trimmed = doiValue.trim();
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return `"DOI": ${trimmed}`;
          }
          return `"DOI": "${trimmed}"`;
        }
      );
      
      responseData = JSON.parse(cleanedResponse);
      console.log('Successfully parsed LLM response with robust cleaner');
    } catch (e) {
      console.error("Robust cleaner failed:", e);
      
      if (e instanceof SyntaxError) {
        console.error("SyntaxError details:", e.message);
        
        let errorPos = -1;
        const posMatch = e.message.match(/position (\d+)/i) || e.message.match(/at position (\d+)/i);
        if (posMatch) {
          errorPos = parseInt(posMatch[1]);
        }
        
        if (errorPos > -1) {
          const robustCleaned = robustJsonCleaner(llmResponse.response);
          console.error(`Error at position ${errorPos} in cleaned string`);
          
          const start = Math.max(0, errorPos - 30);
          const end = Math.min(robustCleaned.length, errorPos + 30);
          const snippet = robustCleaned.substring(start, end);
          console.error("Context around error:", JSON.stringify(snippet));
          
          if (errorPos < robustCleaned.length) {
            const problematicChar = robustCleaned[errorPos];
            console.error(`Problematic character: '${problematicChar}' (code: ${problematicChar.charCodeAt(0)})`);
          }
        }
      }
      
      try {
        const jsonMatch = llmResponse.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let extractedJson = robustJsonCleaner(jsonMatch[0]);
          
          extractedJson = extractedJson.replace(
            /"DOI":\s*([^,}]+)/g,
            (_match: string, doiValue: string) => {
              const trimmed = doiValue.trim();
              if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                return `"DOI": ${trimmed}`;
              }
              return `"DOI": "${trimmed}"`;
            }
          );
          
          responseData = JSON.parse(extractedJson);
          console.log('Successfully parsed with fallback extraction and robust cleaning');
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (fallbackError) {
        console.error("All parsing attempts failed:", fallbackError);
        
        try {
          const salvageAttempt = attemptRegexSalvage(llmResponse.response);
          if (salvageAttempt) {
            responseData = salvageAttempt;
            console.log('Successfully salvaged data with regex approach');
          } else {
            throw new Error('Regex salvage failed');
          }
        } catch (salvageError) {
          console.error("Regex salvage also failed:", salvageError);
          responseData = {
            parsingError: true,
            message: "The metadata could not be properly parsed. Raw data is available.",
            rawResponse: llmResponse.response
          };
        }
      }
    }
  } else if (llmResponse && llmResponse.data && typeof llmResponse.data === 'object') {
    responseData = llmResponse.data;
  }

  return responseData;
}

function attemptRegexSalvage(response: string): any | null {
  const result: any = {};
  
  const keyValuePattern = /"([^"]+)":\s*"([^"]*?)"/g;
  const arrayPattern = /"([^"]+)":\s*\[([^\]]*)\]/g;
  
  let match;
  
  while ((match = keyValuePattern.exec(response)) !== null) {
    const [, key, value] = match;
    result[key] = value.replace(/\\n/g, ' ').trim();
  }
  
  arrayPattern.lastIndex = 0;
  while ((match = arrayPattern.exec(response)) !== null) {
    const [, key, arrayContent] = match;
    const items = arrayContent.split(',').map(item => 
      item.replace(/"/g, '').trim()
    ).filter(item => item.length > 0);
    result[key] = items;
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

export function processResponseData(responseData: any): any {
  if (!responseData || typeof responseData !== 'object' || responseData === null) {
    return responseData;
  }

  if (Object.prototype.hasOwnProperty.call(responseData, 'Installation_Instructions')) {
    const instructions = responseData.Installation_Instructions;
    responseData.InstallationInstructions = normalizeArrayField(instructions);
    delete responseData.Installation_Instructions;
  }
  
  const arrayFields = ['Authors', 'Contributors', 'Keywords', 'Dependencies', 'Funding', 'InstallationInstructions'];
  for (const field of arrayFields) {
    if (field in responseData) {
      responseData[field] = normalizeArrayField(responseData[field]);
    }
  }
  
  for (const [key, value] of Object.entries(responseData)) {
    let fieldName = key.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    
    if (key === 'DOI') {
      fieldName = 'DOI';
    } else if (key === 'InstallationInstructions') {
      fieldName = 'installation instructions';
    } else if (key === 'License') {
      fieldName = 'license';
    } else if (key === 'Keywords') {
      fieldName = 'keywords';
    } else if (key === 'Authors') {
      fieldName = 'authors';
    } else if (key === 'Contributors') {
      fieldName = 'contributors';
    } else if (key === 'Dependencies') {
      fieldName = 'dependencies';
    } else if (key === 'Funding') {
      fieldName = 'funding';
    }
    
    if (!hasValidData(value)) {
      responseData[key] = `No ${fieldName} information available`;
    }
  }

  return responseData;
}

export function cleanHtmlFromFields(obj: any): any {
  if (!obj) return obj;
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/<[^>]*>/g, '')
        .trim();
    } else if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item: any) => {
        if (typeof item === 'string') {
          return item
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&lt;/gi, '<')
            .replace(/&gt;/gi, '>')
            .replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/<[^>]*>/g, '')
            .trim();
        } else if (typeof item === 'object' && item !== null) {
          return cleanHtmlFromFields(item);
        }
        return item;
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      obj[key] = cleanHtmlFromFields(obj[key]);
    }
  }
  return obj;
}

export function extractInstallationInstructions(response: string): string | null {
  const installMatch = response.match(/Installation[_\s]Instructions[:\s]+([\s\S]+?)(?=\n\s*\n\s*[A-Z]|$)/i);
  return installMatch && installMatch[1] ? installMatch[1].trim() : null;
}

export function cleanEmptyDOI(data: any): any {
  if (data && data.DOI && Array.isArray(data.DOI) && data.DOI.length === 0) {
    const cleanedData = { ...data };
    delete cleanedData.DOI;
    return cleanedData;
  }
  return data;
}

export function formatRawResponse(response: string | null): string | null {
  if (!response) return null;
  
  return response
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

export function processRepositoryData(llmResult: any): { 
  responseData: any, 
  formattedRawResponse: string | null,
  success: boolean,
  message?: string 
} {
  try {
    // Step 1: Parse the LLM response
    let responseData = cleanAndParseLLMResponse(llmResult);
    
    // Step 2: Extract installation instructions if needed
    if (!responseData.InstallationInstructions && 
        !responseData.Installation_Instructions && 
        llmResult.response && 
        typeof llmResult.response === 'string') {
      
      const instructions = extractInstallationInstructions(llmResult.response);
      if (instructions) {
        responseData.Installation_Instructions = instructions;
      }
    }
    
    // Step 3: Clean HTML from all fields
    responseData = cleanHtmlFromFields(responseData);
    
    // Step 4: Process the response data (normalizing arrays, etc.)
    responseData = processResponseData(responseData);
    
    // Step 5: Handle empty DOI arrays
    responseData = cleanEmptyDOI(responseData);
    
    // Format the raw response for display
    const formattedRawResponse = formatRawResponse(
      llmResult.response && typeof llmResult.response === 'string' ? llmResult.response : null
    );
    
    return {
      success: true,
      responseData,
      formattedRawResponse
    };
    
  } catch (error) {
    console.error('Error processing repository data:', error);
    
    const formattedRawResponse = formatRawResponse(
      llmResult.response && typeof llmResult.response === 'string' ? llmResult.response : null
    );
    
    return {
      success: false,
      responseData: {
        parsingError: true,
        message: "Failed to parse the metadata properly. Raw response is available below."
      },
      formattedRawResponse,
      message: 'Failed to parse the metadata properly. Raw response is available below.'
    };
  }
}
