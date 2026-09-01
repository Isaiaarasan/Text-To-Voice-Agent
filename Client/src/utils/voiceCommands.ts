/**
 * Voice commands post-processing utility.
 * Transforms dictated natural language formatting commands into clean Markdown.
 */

export interface VoiceCommandRule {
  name: string;
  example: string;
  description: string;
  pattern: RegExp;
  replace: string | ((substring: string, ...args: any[]) => string);
}

export const VOICE_COMMANDS: VoiceCommandRule[] = [
  // Block formatting
  {
    name: 'Heading 1',
    example: '"heading one Project Overview"',
    description: 'Creates a Level 1 Heading',
    pattern: /\b(?:heading\s+one|heading\s+1|main\s+heading)\s+/gi,
    replace: '\n\n# ',
  },
  {
    name: 'Heading 2',
    example: '"heading two Features"',
    description: 'Creates a Level 2 Heading',
    pattern: /\b(?:heading\s+two|heading\s+2|sub\s+heading)\s+/gi,
    replace: '\n\n## ',
  },
  {
    name: 'Heading 3',
    example: '"heading three Details"',
    description: 'Creates a Level 3 Heading',
    pattern: /\b(?:heading\s+three|heading\s+3)\s+/gi,
    replace: '\n\n### ',
  },
  {
    name: 'Bullet Point',
    example: '"bullet point First item"',
    description: 'Creates an unordered list item',
    pattern: /\b(?:bullet\s+point|new\s+bullet|list\s+item)\s+/gi,
    replace: '\n- ',
  },
  {
    name: 'Numbered Item',
    example: '"numbered item Step one"',
    description: 'Creates a numbered list item',
    pattern: /\b(?:numbered\s+item|number\s+one|new\s+number)\s+/gi,
    replace: '\n1. ',
  },
  {
    name: 'Task List',
    example: '"todo Buy groceries"',
    description: 'Creates a Markdown checkbox item',
    pattern: /\b(?:todo\s+item|task\s+item|checklist\s+item)\s+/gi,
    replace: '\n- [ ] ',
  },
  {
    name: 'Blockquote',
    example: '"quote This is a quote"',
    description: 'Creates a blockquote',
    pattern: /\b(?:quote|blockquote)\s+/gi,
    replace: '\n> ',
  },
  {
    name: 'Code Block',
    example: '"code block npm install"',
    description: 'Surrounds with code block syntax',
    pattern: /\b(?:code\s+block|start\s+code)\s+([\s\S]+?)(?:\s+(?:end\s+code|close\s+code)|$)/gi,
    replace: '\n```\n$1\n```\n',
  },
  {
    name: 'Inline Code',
    example: '"inline code variable"',
    description: 'Surrounds with backticks',
    pattern: /\b(?:inline\s+code)\s+([a-zA-Z0-9_-]+)/gi,
    replace: '`$1`',
  },
  {
    name: 'Bold Text',
    example: '"bold important message bold end"',
    description: 'Makes text bold',
    pattern: /\b(?:bold)\s+([\s\S]+?)(?:\s+(?:bold\s+end|end\s+bold)|(?=[,.]|$))/gi,
    replace: '**$1**',
  },
  {
    name: 'Italic Text',
    example: '"italic special note italic end"',
    description: 'Makes text italic',
    pattern: /\b(?:italic)\s+([\s\S]+?)(?:\s+(?:italic\s+end|end\s+italic)|(?=[,.]|$))/gi,
    replace: '*$1*',
  },

  // Line breaks
  {
    name: 'New Line',
    example: '"new line"',
    description: 'Inserts a single line break',
    pattern: /\b(?:new\s+line|next\s+line)\b/gi,
    replace: '\n',
  },
  {
    name: 'New Paragraph',
    example: '"new paragraph"',
    description: 'Inserts a paragraph break',
    pattern: /\b(?:new\s+paragraph|next\s+paragraph)\b/gi,
    replace: '\n\n',
  },

  // Punctuation
  {
    name: 'Full Stop / Period',
    example: '"word period"',
    description: 'Inserts a period',
    pattern: /\s+\b(?:period|full\s+stop)\b/gi,
    replace: '.',
  },
  {
    name: 'Comma',
    example: '"word comma"',
    description: 'Inserts a comma',
    pattern: /\s+\b(?:comma)\b/gi,
    replace: ',',
  },
  {
    name: 'Question Mark',
    example: '"why is that question mark"',
    description: 'Inserts a question mark',
    pattern: /\s+\b(?:question\s+mark)\b/gi,
    replace: '?',
  },
  {
    name: 'Exclamation Mark',
    example: '"awesome exclamation mark"',
    description: 'Inserts an exclamation mark',
    pattern: /\s+\b(?:exclamation\s+mark|exclamation\s+point)\b/gi,
    replace: '!',
  },
];

/**
 * Applies voice command transformations to a raw transcript string
 */
export function processVoiceCommands(rawText: string, enabled: boolean = true): string {
  if (!enabled || !rawText) return rawText;

  let processed = rawText;

  for (const rule of VOICE_COMMANDS) {
    if (typeof rule.replace === 'string') {
      processed = processed.replace(rule.pattern, rule.replace);
    } else {
      processed = processed.replace(rule.pattern, rule.replace);
    }
  }

  // Clean up duplicate spaces and trim leading/trailing newlines
  return processed
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
