import React from "react";

// Keyword lists per language family
const KEYWORDS_JS_TS = new Set([
  "import", "export", "from", "default", "const", "let", "var", "function", "return", "if", "else",
  "switch", "case", "break", "continue", "for", "while", "do", "try", "catch", "finally", "throw",
  "async", "await", "class", "extends", "super", "new", "this", "type", "interface", "enum",
  "typeof", "instanceof", "in", "of", "true", "false", "null", "undefined", "as", "is"
]);

const KEYWORDS_PYTHON = new Set([
  "def", "class", "return", "if", "elif", "else", "while", "for", "in", "import", "from", "as",
  "try", "except", "finally", "raise", "with", "lambda", "yield", "async", "await", "global",
  "nonlocal", "pass", "break", "continue", "True", "False", "None", "and", "or", "not", "is"
]);

const KEYWORDS_SQL = new Set([
  "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON", "GROUP", "BY",
  "HAVING", "ORDER", "ASC", "DESC", "LIMIT", "OFFSET", "INSERT", "INTO", "VALUES", "UPDATE",
  "SET", "DELETE", "CREATE", "TABLE", "DROP", "ALTER", "ADD", "CONSTRAINT", "PRIMARY", "KEY",
  "FOREIGN", "REFERENCES", "AND", "OR", "NOT", "NULL", "IS", "AS", "DISTINCT", "UNION", "ALL",
  "select", "from", "where", "join", "left", "right", "inner", "outer", "on", "group", "by",
  "having", "order", "asc", "desc", "limit", "offset", "insert", "into", "values", "update",
  "set", "delete", "create", "table", "drop", "alter", "add", "constraint", "primary", "key",
  "foreign", "references", "and", "or", "not", "null", "is", "as", "distinct", "union", "all"
]);

const KEYWORDS_BASH = new Set([
  "echo", "sudo", "cd", "mkdir", "rm", "cp", "mv", "ls", "grep", "cat", "chmod", "chown",
  "git", "npm", "pnpm", "yarn", "npx", "docker", "export", "set", "alias", "if", "then", "else",
  "fi", "for", "do", "done", "while", "case", "esac", "function", "return"
]);

/**
 * High-performance, zero-dependency tokenization engine for CodeDisplay syntax highlighting.
 */
export function highlightLine(lineText: string, language: string = "typescript"): React.ReactNode {
  if (!lineText) return "";

  const lang = language.toLowerCase();

  // 1. Whole line comment check
  const trimmed = lineText.trim();
  const isCommentLine =
    ((lang === "python" || lang === "bash") && trimmed.startsWith("#")) ||
    (lang === "sql" && trimmed.startsWith("--")) ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*");

  if (isCommentLine) {
    return <span className="bs-token-comment">{lineText}</span>;
  }

  // Tokenization Regex matching strings, numbers, identifiers, operators, whitespace
  const tokenRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\/.+$|#+$|\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_$][a-zA-Z0-9_$]*|==|===|!=|!==|=>|<=|>=|&&|\|\||[+\-*\/%=<>!&|^~?:;,.(){}  \[\]])/g;

  const tokens: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const keywords =
    lang === "python"
      ? KEYWORDS_PYTHON
      : lang === "sql"
      ? KEYWORDS_SQL
      : lang === "bash"
      ? KEYWORDS_BASH
      : KEYWORDS_JS_TS;

  while ((match = tokenRegex.exec(lineText)) !== null) {
    // Append unmatched leading characters/spaces
    if (match.index > lastIndex) {
      tokens.push(lineText.substring(lastIndex, match.index));
    }

    const value = match[0];
    lastIndex = tokenRegex.lastIndex;

    // String Literals
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith("`") && value.endsWith("`"))
    ) {
      tokens.push(
        <span key={match.index} className="bs-token-string">
          {value}
        </span>
      );
    }
    // Single line inline comment e.g. // comment
    else if (value.startsWith("//") || (value.startsWith("#") && (lang === "python" || lang === "bash"))) {
      tokens.push(
        <span key={match.index} className="bs-token-comment">
          {value}
        </span>
      );
    }
    // Number Literals
    else if (!isNaN(Number(value)) && value.trim() !== "") {
      tokens.push(
        <span key={match.index} className="bs-token-number">
          {value}
        </span>
      );
    }
    // Keywords
    else if (keywords.has(value)) {
      tokens.push(
        <span key={match.index} className="bs-token-keyword">
          {value}
        </span>
      );
    }
    // Function Calls: Identifier followed by '('
    else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value) && lineText[lastIndex] === "(") {
      tokens.push(
        <span key={match.index} className="bs-token-function">
          {value}
        </span>
      );
    }
    // PascalCase Types & Classes
    else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(value) && value !== value.toUpperCase()) {
      tokens.push(
        <span key={match.index} className="bs-token-type">
          {value}
        </span>
      );
    }
    // Operators
    else if (/^(==|===|!=|!==|=>|<=|>=|&&|\|\||[+\-*\/%=<>!?:;])$/.test(value)) {
      tokens.push(
        <span key={match.index} className="bs-token-operator">
          {value}
        </span>
      );
    }
    // Plain text / identifiers
    else {
      tokens.push(value);
    }
  }

  if (lastIndex < lineText.length) {
    tokens.push(lineText.substring(lastIndex));
  }

  return tokens;
}
