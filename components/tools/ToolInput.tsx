import React from "react";

interface ToolInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  hint?: string;
  notice?: string;
}

export function ToolInput({ label, id, hint, notice, ...props }: ToolInputProps) {
  return (
    <div className="tool-input">
      <label htmlFor={id}>
        {label}
        <input id={id} aria-describedby={hint || notice ? `${id}-help` : undefined} {...props} />
      </label>
      {hint || notice ? (
        <p id={`${id}-help`} className={notice ? "tool-input-notice" : "tool-input-hint"}>
          {notice || hint}
        </p>
      ) : null}
    </div>
  );
}
