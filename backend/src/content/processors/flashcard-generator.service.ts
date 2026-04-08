import { Injectable } from '@nestjs/common';
import { StudyMaterial } from '../entities/study-material.entity';

/**
 * FlashcardGeneratorService - Generates flashcards from text content
 * 
 * Analyzes text to create question-answer pairs for flashcards
 * Supports various question types: definitions, functions, comparisons, examples
 * 
 * @class FlashcardGeneratorService
 */
@Injectable()
export class FlashcardGeneratorService {
  /**
   * Generate flashcards from extracted text
   * 
   * @param {string} rawText - Raw text content
   * @param {Object} options - Generation options
   * @param {StudyMaterial} options.material - Study material entity
   * @param {number} options.maxCards - Maximum number of cards to generate
   * @returns {Array<Object>} Generated flashcards
   */
  generate(
    rawText: string,
    { material = null, maxCards = 10 }: { material?: StudyMaterial; maxCards?: number } = {},
  ): Array<{ front_text: string; back_text: string; difficultyLevel: number; setId: number }> {
    const text = (rawText || '').replace(/\r\n/g, '\n').trim();
    const cleanedText = text.replace(/\s+/g, ' ');

    const rawSentences = cleanedText
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
      .filter((sentence) => sentence.split(' ').length >= 6 && sentence.length >= 40);

    const paragraphs = text
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
      .filter((paragraph) => paragraph.split(' ').length >= 10);

    console.log(`📊 FlashcardGenerator: ${rawSentences.length} sentences, ${paragraphs.length} paragraphs available`);

    const generatedFlashcards: Array<{ front_text: string; back_text: string; difficultyLevel: number; setId: number }> = [];
    const seenQuestions = new Set<string>();
    const seenIdeas = new Set<string>();

    const ensureSentenceEnding = (content: string): string => {
      if (!content) return content;
      return /[.?!]$/.test(content.trim()) ? content.trim() : `${content.trim()}.`;
    };

    const clampAnswer = (content: string, limit = 320): string => {
      if (!content) return content;
      return content.length > limit ? `${content.substring(0, limit - 3).trim()}...` : content.trim();
    };

    const normaliseKey = (content: string): string => (content || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

    const determineDifficulty = (question: string, fallback = 1): number => {
      if (!question) return fallback;
      if (/^why\b/i.test(question)) return 3;
      if (/^how\b/i.test(question)) return 2;
      if (/^(compare|contrast|in what way|what is the difference)/i.test(question)) return 3;
      if (/^(when|where|which)/i.test(question)) return 2;
      return fallback;
    };

    const pushCard = (question: string, answer: string, difficulty: number | null = null, signatureKey: string | null = null): boolean => {
      if (!question || !answer) return false;

      const cleanedQuestion = question.replace(/\s+/g, ' ').trim();
      const cleanedAnswer = answer.replace(/\s+/g, ' ').trim();
      if (!cleanedQuestion || !cleanedAnswer) return false;

      const questionKey = normaliseKey(cleanedQuestion);
      const ideaKey = signatureKey ? normaliseKey(signatureKey) : `${questionKey}|${normaliseKey(cleanedAnswer)}`;

      if (seenQuestions.has(questionKey) || seenIdeas.has(ideaKey)) {
        return false;
      }

      const finalDifficulty = difficulty !== null ? difficulty : determineDifficulty(cleanedQuestion, 1);
      const finalAnswer = clampAnswer(ensureSentenceEnding(cleanedAnswer));

      generatedFlashcards.push({
        front_text: cleanedQuestion,
        back_text: finalAnswer,
        difficultyLevel: finalDifficulty,
        setId: material?.id || 0,
      });

      seenQuestions.add(questionKey);
      seenIdeas.add(ideaKey);
      console.log(`✅ FlashcardGenerator: created card #${generatedFlashcards.length} (difficulty ${finalDifficulty})`);
      return true;
    };

    const extractSubject = (sentence: string): string => {
      if (!sentence) return '';
      const defMatch = sentence.match(/^([\w\s\-()\/]+?)\s+(?:is|are|refers to|represents|means|consists of)\s+/i);
      if (defMatch && defMatch[1]) {
        return defMatch[1].trim().replace(/^(the|a|an)\s+/i, '').trim();
      }
      const words = sentence.split(' ').slice(0, 5);
      return words.join(' ').replace(/^(the|this|that|these|those|it)\s+/i, '').trim();
    };

    const createDefinitionCard = (sentence: string): { question: string; answer: string; difficulty: number; key: string } | null => {
      const definitionRegex = /^([\w\s\-()\/]+?)\s+(is|are|refers to|means|represents|consists of|defines)\s+(.*)$/i;
      const match = sentence.match(definitionRegex);
      if (!match) return null;

      const subject = match[1].trim().replace(/^(the|a|an)\s+/i, '').trim();
      const descriptor = match[3].trim();
      if (!subject || subject.length < 2 || descriptor.length < 8) return null;

      const question = `What is ${subject}?`;
      const answer = `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${match[2].toLowerCase()} ${descriptor}`;
      return { question, answer, difficulty: 1, key: subject };
    };

    const createFunctionCard = (sentence: string): { question: string; answer: string; difficulty: number; key: string } | null => {
      const functionRegex = /^([\w\s\-()\/]+?)\s+(allows|enables|helps|ensures|facilitates|provides|supports|manages|controls)\s+(.*)$/i;
      const match = sentence.match(functionRegex);
      if (!match) return null;

      const subject = match[1].trim().replace(/^(the|a|an)\s+/i, '').trim();
      const action = match[3].trim();
      if (!subject || subject.length < 2 || action.length < 8) return null;

      const verbMap: Record<string, string> = {
        allows: 'allow',
        enables: 'enable',
        helps: 'help',
        ensures: 'ensure',
        facilitates: 'facilitate',
        provides: 'provide',
        supports: 'support',
        manages: 'manage',
        controls: 'control',
      };

      const topic = action.split(/,|;| because | by | through /i)[0].trim();
      const question = `How does ${subject} ${verbMap[match[2]] || match[2]} ${topic}?`;
      const answer = sentence;
      return { question, answer, difficulty: 2, key: subject };
    };

    const createImportanceCard = (sentence: string): { question: string; answer: string; difficulty: number; key: string } | null => {
      if (!/(important|critical|essential|vital|key|crucial)/i.test(sentence)) {
        return null;
      }
      const subject = extractSubject(sentence);
      if (!subject) return null;
      return { question: `Why is ${subject} important?`, answer: sentence, difficulty: 3, key: subject };
    };

    const createExampleCard = (sentence: string): { question: string; answer: string; difficulty: number; key: string } | null => {
      const exampleMatch = sentence.match(/(for example|such as|e\.g\.)/i);
      if (!exampleMatch) return null;

      const index = sentence.toLowerCase().indexOf(exampleMatch[1].toLowerCase());
      if (index === -1) return null;

      const topic = sentence.substring(0, index).trim();
      const examples = sentence.substring(index).replace(/^(for example|such as|e\.g\.)/i, '').trim();
      if (!topic || !examples) return null;

      const cleanTopic = topic.replace(/^(the|a|an)\s+/i, '').trim();
      const question = `Can you give an example of ${cleanTopic}?`;
      const answer = `${cleanTopic.charAt(0).toUpperCase()}${cleanTopic.slice(1)} includes examples such as ${examples}`;
      return { question, answer, difficulty: 1, key: cleanTopic };
    };

    const createComparisonCard = (sentence: string, nextSentence = ''): { question: string; answer: string; difficulty: number; key: string } | null => {
      const differenceMatch = sentence.match(/difference between\s+(.+?)\s+and\s+(.+?)(?:[,.;]|$)/i);
      if (differenceMatch) {
        const first = differenceMatch[1].trim();
        const second = differenceMatch[2].trim();
        if (first && second) {
          let answer = ensureSentenceEnding(sentence);
          if (nextSentence && nextSentence.includes(first.split(' ')[0])) {
            answer = `${answer} ${ensureSentenceEnding(nextSentence)}`;
          }
          return { question: `How is ${first} different from ${second}?`, answer, difficulty: 3, key: `${first}-${second}` };
        }
      }

      const vsMatch = sentence.match(/(.+?)\s+(?:vs\.?|versus)\s+(.+?)(?:[,.;]|$)/i);
      if (vsMatch) {
        const first = vsMatch[1].trim();
        const second = vsMatch[2].trim();
        if (first && second) {
          return {
            question: `How does ${first} compare to ${second}?`,
            answer: sentence,
            difficulty: 3,
            key: `${first}-${second}`,
          };
        }
      }

      return null;
    };

    const createConceptualCard = (sentence: string): { question: string; answer: string; difficulty: number; key: string } | null => {
      const subject = extractSubject(sentence);
      if (!subject) return null;
      return {
        question: `What is the core idea behind ${subject}?`,
        answer: sentence,
        difficulty: 2,
        key: subject,
      };
    };

    for (let i = 0; i < rawSentences.length && generatedFlashcards.length < maxCards + 2; i++) {
      const sentence = rawSentences[i];
      const nextSentence = rawSentences[i + 1] || '';

      const builders = [
        () => createComparisonCard(sentence, nextSentence),
        () => createDefinitionCard(sentence),
        () => createFunctionCard(sentence),
        () => createImportanceCard(sentence),
        () => createExampleCard(sentence),
        () => createConceptualCard(sentence),
      ];

      for (const builder of builders) {
        if (generatedFlashcards.length >= maxCards + 2) break;
        const card = builder();
        if (card && pushCard(card.question, card.answer, card.difficulty, card.key)) {
          break;
        }
      }
    }

    paragraphs.some((paragraph) => {
      if (generatedFlashcards.length >= maxCards) return true;
      const topic = extractSubject(paragraph);
      const question = `What is the key takeaway about ${topic || 'this topic'}?`;
      return pushCard(question, paragraph, 2, topic);
    });

    if (generatedFlashcards.length < 5) {
      console.log('⚠️ FlashcardGenerator: fallback to ensure minimum cards');
      for (let i = 0; i < rawSentences.length && generatedFlashcards.length < 5; i++) {
        const sentence = rawSentences[i];
        const subject = extractSubject(sentence) || `point ${generatedFlashcards.length + 1}`;
        const question = `What should you remember about ${subject}?`;
        pushCard(question, sentence, 1, subject);
      }
    }

    if (generatedFlashcards.length > maxCards) {
      generatedFlashcards.length = maxCards;
    }

    console.log(`📝 FlashcardGenerator: returning ${generatedFlashcards.length} cards`);
    return generatedFlashcards;
  }
}

