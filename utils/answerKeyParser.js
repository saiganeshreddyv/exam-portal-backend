// utils/answerKeyParser.js

export function parseAnswerKey(text) {
  const answerMap = {};

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    /*
      Supports formats like:
      1 - A
      2: B
      Q3 C
      4) D
    */
    const match = line.match(/(?:Q)?(\d+)\s*[-:.)]?\s*([A-D])/i);

    if (match) {
      const questionNumber = parseInt(match[1], 10);
      const answer = match[2].toUpperCase();
      answerMap[questionNumber] = answer;
    }
  }

  return answerMap;
}
