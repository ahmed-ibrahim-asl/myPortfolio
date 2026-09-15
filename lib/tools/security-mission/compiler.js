import { quoteShellArgument } from "./quoting.js";
import { evaluateSecurityRule } from "./control-registry.js";
import { getSecurityFlagDescription } from "./flag-glossary.js";

function resolveValue(project, valuePath) {
  if (!project || !valuePath) return undefined;
  return valuePath.split('.').reduce((o, k) => (o || {})[k], project);
}

// Builds a single composed value (e.g. a msfconsole -x resource script) out of several
// optional fields. Each segment either always contributes its literal text, or contributes
// `literal + resolvedValue` only when that value is non-empty; a `required` segment that
// resolves empty blanks the whole composition (so the caller's omitWhenEmpty can drop the rule).
function composeTemplateValue(project, segments) {
  let out = "";
  for (const segment of segments) {
    if (segment.mapLiteral) {
      const resolved = resolveValue(project, segment.valuePath);
      out += segment.mapLiteral[resolved] ?? segment.default ?? "";
      continue;
    }
    if (segment.valuePath) {
      const resolved = resolveValue(project, segment.valuePath);
      if (resolved === undefined || resolved === null || resolved === "") {
        if (segment.required) return "";
        continue;
      }
      out += (segment.literal ?? "") + resolved;
      continue;
    }
    out += segment.literal ?? "";
  }
  return out;
}

export function compileSecurityCommand(project, action) {
  if (!action.verification || (!["local-help", "official-docs"].includes(action.verification.evidenceTier))) {
    throw new Error("Action is missing public verification evidence.");
  }
  if (action.verification.evidenceTier === "official-docs" && (!Array.isArray(action.verification.sourceUrls) || action.verification.sourceUrls.length === 0)) {
    throw new Error("Action with official-docs evidence is missing source URLs.");
  }

  const shell = project.shell || "bash";
  const executable = action.executable[project.platform] || action.executable.linux;
  const tokens = [
    { type: "executable", value: executable, sourcePath: null },
  ];
  const placeholders = [];
  let commandParts = [executable];

  if (action.fixedTokens) {
    for (const ft of action.fixedTokens) {
      if (ft.type === "flag") {
        commandParts.push(ft.value);
        tokens.push({
          type: "flag",
          value: ft.value,
          sourcePath: null,
          flagDescription: getSecurityFlagDescription(action.toolId, ft.value),
        });
      }
    }
  }

  if (action.argumentRules) {
    for (const rule of action.argumentRules) {
      if (rule.when && !evaluateSecurityRule(rule.when, project)) continue;

      const value = rule.composeFrom
        ? composeTemplateValue(project, rule.composeFrom)
        : resolveValue(project, rule.valuePath);

      if (value === undefined || value === null || value === "") {
        if (rule.omitWhenEmpty) continue;
        placeholders.push(rule.valuePath);
        tokens.push({
          type: "placeholder",
          value: `<${rule.valuePath}>`,
          sourcePath: rule.valuePath,
        });
      }

      if (rule.positional) {
        if (value) {
          const quoted = quoteShellArgument(value, shell);
          commandParts.push(quoted);
          tokens.push({
            type: "positional",
            value,
            quoted,
            sourcePath: rule.valuePath,
          });
        }
      } else if (rule.rawFlagFromValue) {
        // The control's chosen value IS the flag (e.g. a scan-type select whose options are
        // literally "-sS", "-sT", ...), so it's inserted as-is rather than as a flag+value pair.
        if (value) {
          commandParts.push(value);
          tokens.push({
            type: "flag",
            value,
            sourcePath: rule.valuePath,
            flagDescription: getSecurityFlagDescription(action.toolId, value),
          });
        }
      } else if (rule.flag) {
        const hasValue = value !== undefined && value !== null && value !== "" && typeof value !== "boolean";
        if (rule.joinFlag && hasValue) {
          // Flags whose own syntax has no space before the value (john's --wordlist=,
          // msfvenom's LHOST=, nmap's -T4) get concatenated into one shell word instead of
          // the normal flag/value pair - a space there would silently change what's parsed.
          const combined = `${rule.flag}${value}`;
          const quoted = quoteShellArgument(combined, shell);
          commandParts.push(quoted);
          tokens.push({
            type: "flag",
            value: rule.flag,
            quoted,
            sourcePath: rule.valuePath,
            flagDescription: getSecurityFlagDescription(action.toolId, rule.flag),
          });
        } else {
          commandParts.push(rule.flag);
          tokens.push({
            type: "flag",
            value: rule.flag,
            sourcePath: rule.valuePath,
            flagDescription: getSecurityFlagDescription(action.toolId, rule.flag),
          });
          if (hasValue) {
            const quoted = quoteShellArgument(value, shell);
            commandParts.push(quoted);
            tokens.push({
              type: "value",
              value,
              quoted,
              sourcePath: rule.valuePath,
            });
          }
        }
      }
    }
  }

  const command = commandParts.join(" ");
  const formatted = commandParts.join(" \\\n  ");

  return {
    actionId: action.id,
    toolId: action.toolId,
    shell,
    command,
    formatted,
    tokens,
    summary: `Compiled ${action.title || action.id}`,
    warnings: [],
    placeholders,
    evidenceId: action.verification.evidenceId,
    sourceUrls: action.verification.sourceUrls || [],
  };
}
