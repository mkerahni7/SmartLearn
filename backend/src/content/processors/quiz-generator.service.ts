import { Injectable } from '@nestjs/common';

/**
 * QuizGeneratorService - Generates quiz questions from text content
 * 
 * Analyzes text to create multiple-choice questions
 * Supports various question types: definitions, functions, comparisons, applications
 * 
 * @class QuizGeneratorService
 */
@Injectable()
export class QuizGeneratorService {
  /**
   * Generate quiz questions from extracted text
   * 
   * @param {string} rawText - Raw text content
   * @param {Object} options - Generation options
   * @param {number} options.targetQuestions - Target number of questions
   * @returns {Array<Object>} Generated quiz questions
   */
  generate(
    rawText: string,
    { targetQuestions = 5 }: { targetQuestions?: number } = {},
  ): Array<{ question: string; options: string[]; correctAnswer: number }> {
    const textToAnalyze = (rawText || '').trim();
    const questions: Array<{ question: string; options: string[]; correctAnswer: number }> = [];

    if (!textToAnalyze) {
      console.log('⚠️ QuizGenerator: empty text supplied, no questions generated');
      return questions;
    }

    const STOP_WORDS = new Set([
      'there', 'their', 'about', 'which', 'these', 'those', 'where', 'when', 'what', 'your', 'have', 'will',
      'would', 'could', 'should', 'because', 'while', 'after', 'before', 'since', 'between', 'among', 'into',
      'using', 'through', 'other', 'another', 'first', 'second', 'third', 'being', 'been', 'against', 'within',
      'without', 'therefore', 'however', 'different', 'important', 'several', 'types', 'based', 'material',
      'using', 'include', 'including', 'also', 'such', 'many', 'most', 'some', 'often', 'even', 'every', 'take',
      'make', 'made', 'good', 'better', 'best', 'much', 'more', 'less', 'from', 'than', 'then', 'them', 'they',
      'this', 'that', 'with', 'have', 'each',
    ]);

    const ensureSentence = (text: string): string => {
      if (!text) return '';
      const trimmed = text.replace(/\s+/g, ' ').trim();
      if (!trimmed) return '';
      return /[.?!]$/.test(trimmed) ? trimmed : `${trimmed}.`;
    };

    const shuffleArray = <T>(array: T[]): T[] => {
      const result = [...array];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };

    const cleanSubject = (subject: string): string => subject.replace(/^(the|a|an)\s+/i, '').trim();

    const sentenceMatches = textToAnalyze.match(/[^.!?]+[.!?]/g) || [];
    const processedSentences = sentenceMatches
      .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
      .filter((sentence) => sentence.split(' ').length >= 6 && sentence.length >= 40);

    const definitions: Array<{ subject: string; verb: string; descriptor: string; sentence: string }> = [];
    const functionsData: Array<{ subject: string; verb: string; action: string; sentence: string }> = [];
    const comparisons: Array<{ items: string[]; summary: string }> = [];

    processedSentences.forEach((sentence) => {
      const normalized = ensureSentence(sentence);
      const lower = normalized.toLowerCase();

      // Extract definitions
      const definitionRegex = /^([\w\s\-()\/]+?)\s+(is|are|refers to|means|represents|consists of|defines|describes)\s+(.*)$/i;
      const definitionMatch = normalized.match(definitionRegex);
      if (definitionMatch) {
        const subject = cleanSubject(definitionMatch[1]);
        const descriptor = definitionMatch[3]?.trim().replace(/\s+/g, ' ');
        if (subject && descriptor && descriptor.length > 8) {
          definitions.push({
            subject,
            verb: definitionMatch[2],
            descriptor: descriptor.replace(/[.]+$/, ''),
            sentence: normalized,
          });
        }
      }

      // Extract functions
      const functionRegex = /^([\w\s\-()\/]+?)\s+(handles|manages|controls|ensures|facilitates|enables|allows|helps|processes|provides|routes|connects)\s+(.*)$/i;
      const functionMatch = normalized.match(functionRegex);
      if (functionMatch) {
        const subject = cleanSubject(functionMatch[1]);
        const action = functionMatch[3]?.trim().replace(/[.]+$/, '');
        if (subject && action && action.length > 8) {
          functionsData.push({
            subject,
            verb: functionMatch[2],
            action,
            sentence: normalized,
          });
        }
      }

      // Extract comparisons
      const diffMatch = normalized.match(/difference\s+between\s+([\w\s\-()\/]+?)\s+and\s+([\w\s\-()\/]+?)(?:[,.;]|$)/i);
      if (diffMatch) {
        const first = cleanSubject(diffMatch[1]);
        const second = cleanSubject(diffMatch[2]);
        if (first && second && first.toLowerCase() !== second.toLowerCase()) {
          comparisons.push({
            items: [first, second],
            summary: normalized,
          });
        }
      }
    });

    const buildOptions = (
      correct: string,
      candidatePool: string[] = [],
      fallbackPool: string[] = [],
    ): { options: string[]; correctIndex: number } | null => {
      const uniqueOptions: string[] = [];
      const seen = new Set<string>();

      const pushOption = (text: string): void => {
        if (!text) return;
        const formatted = ensureSentence(text);
        if (!formatted || formatted.length < 12) return;
        const key = formatted.toLowerCase();
        if (key === correct.toLowerCase()) return;
        if (seen.has(key)) return;
        seen.add(key);
        uniqueOptions.push(formatted);
      };

      shuffleArray(candidatePool).forEach(pushOption);
      shuffleArray(fallbackPool).forEach(pushOption);

      if (uniqueOptions.length < 3) {
        return null;
      }

      const distractors = uniqueOptions.slice(0, 3);
      const options = shuffleArray([correct, ...distractors]);
      const correctIndex = options.indexOf(correct);
      return {
        options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
      };
    };

    // Generate definition questions (up to targetQuestions)
    definitions.slice(0, Math.min(targetQuestions, definitions.length)).forEach((def) => {
      if (questions.length >= targetQuestions) return;
      const question = `What is ${def.subject}?`;
      const correct = ensureSentence(`${def.subject} ${def.verb.toLowerCase()} ${def.descriptor}`);
      const candidatePool = definitions
        .filter((d) => d.subject.toLowerCase() !== def.subject.toLowerCase())
        .map((d) => ensureSentence(`${d.subject} ${d.verb.toLowerCase()} ${d.descriptor}`));

      const optionSet = buildOptions(correct, candidatePool, [
        `${def.subject} focuses solely on the physical transmission of signals.`,
        `${def.subject} is mainly an interface feature for end users.`,
        `${def.subject} exists primarily for historical compatibility reasons.`,
      ]);

      if (optionSet) {
        questions.push({
          question,
          options: optionSet.options,
          correctAnswer: optionSet.correctIndex,
        });
      }
    });

    // Generate function questions (up to targetQuestions)
    functionsData.slice(0, Math.min(targetQuestions, functionsData.length)).forEach((func) => {
      if (questions.length >= targetQuestions) return;
      const question = `What is the role of ${func.subject}?`;
      const correct = ensureSentence(`${func.subject} ${func.verb.toLowerCase()} ${func.action}`);
      const candidatePool = functionsData
        .filter((f) => f.subject.toLowerCase() !== func.subject.toLowerCase())
        .map((f) => ensureSentence(`${f.subject} ${f.verb.toLowerCase()} ${f.action}`));

      const optionSet = buildOptions(correct, candidatePool, [
        `${func.subject} provides only optional documentation support.`,
        `${func.subject} simply mirrors the duties of higher layers without change.`,
        `${func.subject} is rarely used in practical deployments and remains inactive.`,
      ]);

      if (optionSet) {
        questions.push({
          question,
          options: optionSet.options,
          correctAnswer: optionSet.correctIndex,
        });
      }
    });

    // Generate comparison questions (up to targetQuestions)
    comparisons.slice(0, Math.min(targetQuestions, comparisons.length)).forEach((comp) => {
      if (questions.length >= targetQuestions) return;
      const [first, second] = comp.items;
      const question = `How does ${first} differ from ${second}?`;
      const correct = ensureSentence(comp.summary);
      const candidatePool = comparisons
        .filter((c) => c !== comp)
        .map((c) => ensureSentence(c.summary));

      const optionSet = buildOptions(correct, candidatePool, [
        `${first} and ${second} always provide identical capabilities in every scenario.`,
        `${first} is merely a renamed version of ${second} with no real differences.`,
        `${second} completely replaces ${first}, making ${first} unnecessary.`,
      ]);

      if (optionSet) {
        questions.push({
          question,
          options: optionSet.options,
          correctAnswer: optionSet.correctIndex,
        });
      }
    });

    // Fallback to fact questions - ensure we reach targetQuestions
    if (questions.length < targetQuestions && processedSentences.length > 0) {
      const needed = targetQuestions - questions.length;
      let attempts = 0;
      const maxAttempts = processedSentences.length * 2; // Try more sentences to get valid questions
      
      for (const sentence of processedSentences) {
        if (questions.length >= targetQuestions || attempts >= maxAttempts) break;
        attempts++;
        
        const question = `Which statement is supported by the material?`;
        const correct = ensureSentence(sentence);
        if (!correct || correct.length < 10) continue; // Skip very short sentences
        
        const candidatePool = processedSentences
          .filter((s) => s.toLowerCase() !== sentence.toLowerCase() && s.length >= 10)
          .map(ensureSentence)
          .filter(s => s && s.length >= 10);

        const optionSet = buildOptions(correct, candidatePool);
        if (optionSet && optionSet.options.length >= 2) {
          questions.push({
            question,
            options: optionSet.options,
            correctAnswer: optionSet.correctIndex,
          });
        }
      }
    }
    
    // Final fallback: if still not enough questions, create simple fact-based questions
    if (questions.length < targetQuestions && processedSentences.length > 0) {
      const needed = targetQuestions - questions.length;
      const usedSentences = new Set();
      
      processedSentences.forEach((sentence) => {
        if (questions.length >= targetQuestions) return;
        if (usedSentences.has(sentence.toLowerCase())) return;
        
        const cleanSentence = ensureSentence(sentence);
        if (!cleanSentence || cleanSentence.length < 20) return;
        
        usedSentences.add(sentence.toLowerCase());
        
        // Extract key terms for question
        const words = cleanSentence.split(' ').filter(w => w.length > 4);
        if (words.length < 2) return;
        
        const subject = words[0];
        const question = `What is true about ${subject}?`;
        const correct = cleanSentence;
        
        // Create simple options
        const otherSentences = processedSentences
          .filter(s => s.toLowerCase() !== sentence.toLowerCase() && s.length >= 20)
          .slice(0, 3)
          .map(ensureSentence);
        
        const options = [correct, ...otherSentences.slice(0, 3)];
        if (options.length >= 2) {
          // Shuffle options
          const shuffled = [...options].sort(() => Math.random() - 0.5);
          const correctIndex = shuffled.indexOf(correct);
          
          questions.push({
            question,
            options: shuffled.length >= 4 ? shuffled.slice(0, 4) : shuffled,
            correctAnswer: correctIndex >= 0 ? correctIndex : 0,
          });
        }
      });
    }

    console.log(`📝 QuizGenerator: returning ${questions.length} questions`);
    return questions.slice(0, targetQuestions);
  }
}

