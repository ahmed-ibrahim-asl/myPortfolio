"use client";

import Link from "next/link";

import { useModelMission } from "@/lib/hooks/useModelMission";
import {
  MODEL_MISSION_STEPS,
} from "@/lib/tools/ml-generator/model-mission/catalog";
import {
  buildMissionProjectBundle,
} from "@/lib/tools/ml-generator/model-mission/project-bundle";
import {
  encodeStoredZip,
} from "@/lib/tools/ml-generator/model-mission/stored-zip";

import { MissionCodePanel } from "./MissionCodePanel";
import { MissionStepPanel } from "./MissionStepPanel";
import { WorkflowRail } from "./WorkflowRail";
import { ToolDirectAnswer, ToolSearchHook, ToolSearchSchema } from "@/components/tools/ToolSearchHook";
import styles from "./ModelMission.module.css";

type MissionProjectBundle = ReturnType<
  typeof buildMissionProjectBundle
>;

function downloadProjectBundle(
  bundle: MissionProjectBundle,
): void {
  const archive = encodeStoredZip(bundle.files);
  const archiveBuffer = new ArrayBuffer(archive.byteLength);
  new Uint8Array(archiveBuffer).set(archive);
  const blob = new Blob(
    [archiveBuffer],
    { type: "application/zip" },
  );
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${bundle.rootName}.zip`;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ModelMissionShell() {
  const {
    state,
    dispatch,
    task,
    status,
    result,
    error,
    legacyRecipe,
    legacyConfig,
    visibleLegacyFields,
    patchLegacyField,
    retry,
  } = useModelMission();

  if (!task) return null;

  const currentStepIndex = MODEL_MISSION_STEPS.findIndex(
    ({ id }) => id === state.stepId,
  );
  const canGoBack = currentStepIndex > 0;
  const canGoNext =
    currentStepIndex < MODEL_MISSION_STEPS.length - 1;

  const handleCopy = async () => {
    if (!result?.code) return;
    try {
      await navigator.clipboard.writeText(result.code);
      dispatch({
        type: "set-copy-status",
        status: "copied",
      });
    } catch {
      dispatch({
        type: "set-copy-status",
        status: "failed",
      });
    }
    window.setTimeout(() => {
      dispatch({
        type: "set-copy-status",
        status: "idle",
      });
    }, 1800);
  };

  const handleDownloadPython = () => {
    if (
      status !== "ready"
      || !result?.code
      || !result.filename
      || Object.keys(result.validationErrors).length > 0
    ) return;
    const blob = new Blob(
      [result.code],
      { type: "text/x-python;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.filename;
      anchor.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadProject = () => {
    if (
      status !== "ready"
      || !result?.code
      || Object.keys(result.validationErrors).length > 0
    ) return;
    downloadProjectBundle(buildMissionProjectBundle({
      result,
      project: result.resolvedConfig,
      task,
    }));
  };

  return (
    <section
      className={`${styles.root} asl-model-mission-shell`}
      data-model-mission
      data-learning-level={state.project.learningLevel}
      style={{
        "--panel": "var(--bg-surface)",
        "--panel-raised": "var(--bg-raised)",
        "--pixel-cyan": "var(--text-accent)",
        "--pixel-green": "var(--text-accent)",
        "--pixel-gold": "var(--text-accent)",
        "--muted": "var(--text-secondary)",
        "--pixel-shadow": "#080A0D",
      } as React.CSSProperties}
    >
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <Link href="/tools/" className={styles.backLink}>
              Back to tools
            </Link>
            <span className={styles.kicker}>AI / ML guided builder</span>
            <h1>Model Mission</h1>
            <p>
              From problem to Python, one decision at a time.
            </p>
          </div>
          <div className={styles.heroReadout}>
            <span>Active mission</span>
            <strong>{task.title}</strong>
            <small>{task.technicalTerm}</small>
          </div>
        </header>

        <ToolDirectAnswer slug="ai-script-generator" />
        <ToolSearchSchema slug="ai-script-generator" />

        <details className={styles.levelDisclosure}>
          <summary>
            Guided mode: safe defaults shown
            {state.project.learningLevel !== "guided"
              ? ` (currently: ${state.project.learningLevel})`
              : ""}
          </summary>
          <div
            className={styles.levelSwitch}
            role="group"
            aria-label="Explanation level"
          >
            {[
              ["guided", "Guided", "Safe defaults"],
              ["customize", "Customize", "More choices"],
              ["advanced", "Advanced", "Production controls"],
            ].map(([value, label, help]) => (
              <button
                type="button"
                key={value}
                aria-pressed={state.project.learningLevel === value}
                data-active={
                  state.project.learningLevel === value
                    ? "true"
                    : "false"
                }
                onClick={() => dispatch({
                  type: "set-learning-level",
                  level: value,
                })}
              >
                <strong>{label}</strong>
                <span>{help}</span>
              </button>
            ))}
          </div>
        </details>

        <WorkflowRail
          activeStepId={state.stepId}
          onChoose={(stepId) => dispatch({
            type: "go-to-step",
            stepId,
          })}
        />

        <div
          className={styles.mobileTabs}
          data-mission-mobile-tabs
          role="tablist"
          aria-label="Mobile workspace"
        >
          <button
            type="button"
            role="tab"
            aria-selected={state.workspaceTab === "configure"}
            onClick={() => dispatch({
              type: "set-workspace-tab",
              tab: "configure",
            })}
          >
            Configure
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={state.workspaceTab === "code"}
            onClick={() => dispatch({
              type: "set-workspace-tab",
              tab: "code",
            })}
          >
            Code
          </button>
        </div>

        <div
          className={styles.workspace}
          data-mobile-active={state.workspaceTab}
        >
          <div
            className={styles.configurePanel}
            data-mission-config-panel
            data-workspace-panel="configure"
          >
            <MissionStepPanel
              task={task}
              stepId={state.stepId}
              project={state.project}
              legacyRecipe={legacyRecipe}
              legacyConfig={legacyConfig}
              visibleLegacyFields={visibleLegacyFields}
              dispatch={dispatch}
              patchLegacyField={patchLegacyField}
            />
            <footer className={styles.stepActions}>
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => dispatch({
                  type: "previous-step",
                })}
              >
                Previous
              </button>
              <span>
                Step {currentStepIndex + 1} of{" "}
                {MODEL_MISSION_STEPS.length}
              </span>
              {canGoNext ? (
                <button
                  type="button"
                  onClick={() => dispatch({
                    type: "next-step",
                  })}
                >
                  Continue to{" "}
                  {MODEL_MISSION_STEPS[
                    currentStepIndex + 1
                  ].shortLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({
                    type: "set-workspace-tab",
                    tab: "code",
                  })}
                >
                  View Python
                </button>
              )}
            </footer>
          </div>

          <div
            className={styles.codeWorkspace}
            data-workspace-panel="code"
          >
            <MissionCodePanel
              status={status as 'loading' | 'ready' | 'error'}
              result={result}
              error={error}
              copyStatus={state.copyStatus}
              onCopy={handleCopy}
              onDownloadPython={handleDownloadPython}
              onDownloadProject={handleDownloadProject}
              onRetry={retry}
            />
          </div>
        </div>

        <ToolSearchHook slug="ai-script-generator" />
      </div>
    </section>
  );
}
