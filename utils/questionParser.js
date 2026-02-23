// utils/questionParser.js

function normalizeText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitQuestions(text) {
  return text.split(/\n(?=\d+[\.\)]|\bQ\d+)/i);
}

function detectBoldOption(block, options) {
  for (const key in options) {
    const regex = new RegExp(`\\b${options[key]}\\b`, "g");
    const matches = block.match(regex);
    if (matches && matches.length > 1) {
      return key;
    }
  }

  for (const key in options) {
    if (options[key] === options[key].toUpperCase()) {
      return key;
    }
  }

  return null;
}
function parseQuestionBlock(block) {
  // Extract question
  const questionMatch = block.match(/^\d+\.\s*(.*?)(A\))/s);
  if (!questionMatch) return null;

  const question = questionMatch[1].trim();

  // Extract inline options (same-line supported)
  const optionRegex = /([A-D])\)\s*([^A-D]+)/g;
  let options = {};
  let match;

  while ((match = optionRegex.exec(block)) !== null) {
    options[match[1]] = match[2].trim();
  }

  return {
    question,
    options,
    correctOption: null, // user will select in preview
  };
}

export function parseQuestionsFromText(text) {
  const cleaned = text
    .replace(/Answer all ten questions.*?\n/gi, "")
    .replace(/\d+Q×.*?\n/gi, "")
    .trim();

  const blocks = cleaned.split(/\n(?=\d+\.)/);
  const questions = [];

  for (const block of blocks) {
    // 1. Extract question
    const qMatch = block.match(/^\d+\.\s*(.*?)\n/s);
    if (!qMatch) continue;

    const question = qMatch[1].trim();

    // 2. Extract correct answer (Answer : X)
    const answerMatch = block.match(/Answer\s*:\s*([A-D])/i);
    const correctOption = answerMatch
      ? answerMatch[1].toUpperCase()
      : null;

    // 3. Remove answer line before parsing options
    const withoutAnswer = block.replace(/Answer\s*:\s*[A-D]/i, "").trim();

    // 4. Extract options cleanly
    const optionsMatch = withoutAnswer.match(
      /A\)\s*(.*?)\s*B\)\s*(.*?)\s*C\)\s*(.*?)\s*D\)\s*(.*)/s
    );

    if (!optionsMatch) continue;

    const options = {
      A: optionsMatch[1].trim(),
      B: optionsMatch[2].trim(),
      C: optionsMatch[3].trim(),
      D: optionsMatch[4].trim(),
    };

    questions.push({
      question,
      options,
      correctOption, // ✅ NOW SET PROPERLY
    });
  }

  return questions;
}


