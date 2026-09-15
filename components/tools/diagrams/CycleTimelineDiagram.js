import { LiveWaveDiagram } from "./LiveWaveDiagram";
export function CycleTimelineDiagram({ period = 0.02, caption }) {
  return <LiveWaveDiagram cycle={period} unit="s" symbol="T" caption={caption} />;
}
