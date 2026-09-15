import { LiveWaveDiagram } from "./LiveWaveDiagram";
export function WavelengthDiagram({ wavelength = 3, caption }) {
  return <LiveWaveDiagram cycle={wavelength} unit="m" symbol="λ" caption={caption} />;
}
