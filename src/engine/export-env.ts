import type { PipelineParams } from "./types";
import { PARAMETERS } from "./defaults";

export function generateEnvText(params: PipelineParams): string {
  const lines: string[] = [
    "# EasyDoor Pipeline — Calibração",
    `# Gerado em ${new Date().toISOString().slice(0, 10)}`,
    "",
  ];

  let currentGroup = "";
  for (const meta of PARAMETERS) {
    if (meta.group !== currentGroup) {
      if (currentGroup) lines.push("");
      lines.push(`# ${meta.group}`);
      currentGroup = meta.group;
    }
    const val = params[meta.key];
    lines.push(`${meta.key}=${val}`);
  }

  lines.push("");
  return lines.join("\n");
}
