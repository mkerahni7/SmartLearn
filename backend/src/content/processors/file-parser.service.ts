import { Injectable } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import * as mammoth from 'mammoth';
import { StudyMaterial } from '../entities/study-material.entity';

// pdf-parse is a CommonJS module, we'll import it dynamically when needed

/**
 * FileParserService - Extracts text from various file types
 * 
 * Supports: PDF, DOCX, PPTX, TXT
 * Falls back to material description/title if file cannot be read
 * 
 * @class FileParserService
 */
@Injectable()
export class FileParserService {
  /**
   * Extract plain text from a study material's uploaded file
   * 
   * @param {StudyMaterial} material - Study material entity
   * @returns {Promise<string>} Extracted text content
   */
  async extractText(material: StudyMaterial): Promise<string> {
    if (!material) {
      return '';
    }

    let extractedText = '';

    try {
      if (material.filePath) {
        const fullPath = resolve(process.cwd(), material.filePath);
        console.log(`📄 Attempting to read file: ${fullPath}`);

        if (existsSync(fullPath)) {
          const fileBuffer = readFileSync(fullPath);
          const ext = extname(fullPath).toLowerCase();
          console.log(`📄 File extension: ${ext}`);

          if (ext === '.txt') {
            extractedText = fileBuffer.toString('utf8');
            console.log(`✅ Read TXT file: ${extractedText.length} characters`);
          } else if (ext === '.pdf') {
            // Use require for pdf-parse (CommonJS module)
            // In pdf-parse v2.x, we need to access the function correctly
            const pdfParseModule = require('pdf-parse');
            // pdf-parse v2.x exports PDFParse as a class/function
            // Try to get the actual parse function
            let pdfParse: any;
            if (typeof pdfParseModule === 'function') {
              pdfParse = pdfParseModule;
            } else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
              pdfParse = pdfParseModule.default;
            } else if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
              pdfParse = pdfParseModule.PDFParse;
            } else {
              // Last resort: try to find any function in the module
              const funcKeys = Object.keys(pdfParseModule).filter(k => typeof pdfParseModule[k] === 'function');
              if (funcKeys.length > 0) {
                // PDFParse is likely the main function
                pdfParse = pdfParseModule.PDFParse || pdfParseModule[funcKeys[0]];
              }
            }
            
            if (!pdfParse || typeof pdfParse !== 'function') {
              console.error('❌ pdf-parse function not found. Available keys:', Object.keys(pdfParseModule));
              throw new Error('pdf-parse function not available');
            }
            
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text;
            console.log(`✅ Parsed PDF file: ${extractedText.length} characters`);
          } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            extractedText = result.value;
            console.log(`✅ Parsed DOCX file: ${extractedText.length} characters`);
          } else if (ext === '.pptx' || ext === '.ppt') {
            extractedText = await this.extractPptText(fileBuffer);
            console.log(`✅ Parsed PPT file: ${extractedText.length} characters`);
          } else {
            extractedText = fileBuffer.toString('utf8');
            console.log(`✅ Read file as text: ${extractedText.length} characters`);
          }

          if (extractedText) {
            console.log(`📝 First 200 chars: ${extractedText.substring(0, 200)}`);
          }
        } else {
          console.log(`⚠️ File not found: ${fullPath}`);
        }
      }
    } catch (error) {
      console.error('❌ Error reading file:', error.message);
    }

    if (!extractedText) {
      extractedText = material.description || material.title || '';
    }

    return extractedText;
  }

  /**
   * Extract text from PowerPoint files (PPTX)
   * 
   * @param {Buffer} fileBuffer - File buffer
   * @returns {Promise<string>} Extracted text
   */
  private async extractPptText(fileBuffer: Buffer): Promise<string> {
    try {
      // Dynamic import to handle optional dependency
      const unzipper = await import('unzipper');
      const directory = await unzipper.Open.buffer(fileBuffer);
      const xmlFiles: string[] = [];

      for (const file of directory.files) {
        if (file.path.includes('slide') && file.path.endsWith('.xml')) {
          const content = await file.buffer();
          xmlFiles.push(content.toString('utf8'));
        }
      }

      // Extract text from XML (simple regex-based extraction)
      const textContent = xmlFiles
        .join(' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return textContent;
    } catch (error) {
      console.error('❌ Error extracting PPT text:', error.message);
      return '';
    }
  }
}

