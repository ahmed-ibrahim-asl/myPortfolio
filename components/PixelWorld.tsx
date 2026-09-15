import React from "react";

export function PixelWorld() {
  return (
    <div className="pixel-world" aria-hidden="true">
      <svg viewBox="0 0 960 420" role="presentation" shapeRendering="crispEdges">
        <rect className="pixel-sky" width="960" height="420" />

        {/* Stars */}
        <g className="pixel-stars">
          <rect x="64" y="38" width="8" height="8" />
          <rect x="156" y="78" width="6" height="6" />
          <rect x="742" y="42" width="8" height="8" />
          <rect x="852" y="92" width="6" height="6" />
          <rect x="300" y="28" width="4" height="4" />
          <rect x="520" y="54" width="6" height="6" />
        </g>

        {/* Clouds */}
        <g className="pixel-clouds">
          <rect x="96" y="74" width="168" height="14" />
          <rect x="126" y="60" width="92" height="14" />
          <rect x="660" y="86" width="194" height="14" />
          <rect x="700" y="72" width="114" height="14" />
        </g>

        {/* City background buildings */}
        <g className="pixel-city-back">
          <rect x="0" y="180" width="110" height="200" />
          <rect x="126" y="222" width="112" height="158" />
          <rect x="254" y="154" width="144" height="226" />
          <rect x="414" y="206" width="118" height="174" />
          <rect x="548" y="136" width="164" height="244" />
          <rect x="728" y="196" width="104" height="184" />
          <rect x="848" y="164" width="112" height="216" />
        </g>

        {/* Building windows */}
        <g className="pixel-windows">
          {[
            [24, 214], [58, 214], [24, 248], [58, 282], [148, 248],
            [188, 248], [278, 188], [320, 188], [362, 222], [438, 238],
            [474, 238], [578, 172], [620, 172], [662, 206], [752, 228],
            [786, 262], [874, 198], [914, 232]
          ].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="16" height="10" />)}
        </g>

        {/* Platforms */}
        <g className="pixel-platforms">
          <rect x="0" y="350" width="244" height="18" />
          <rect x="98" y="330" width="188" height="12" />
          <rect x="336" y="310" width="246" height="20" />
          <rect x="382" y="288" width="154" height="12" />
          <rect x="670" y="338" width="290" height="20" />
          <rect x="730" y="316" width="170" height="12" />
        </g>

        {/* Circuit traces */}
        <g className="pixel-circuit">
          <path d="M38 144H210V112H350V132H506" />
          <path d="M506 132H690V104H922" />
          <rect x="202" y="104" width="16" height="16" />
          <rect x="498" y="124" width="16" height="16" />
          <rect x="682" y="96" width="16" height="16" />
        </g>

        {/* Antenna tower */}
        <g className="pixel-antenna">
          <rect x="810" y="154" width="12" height="184" />
          <rect x="786" y="150" width="60" height="12" />
          <rect x="796" y="122" width="40" height="28" />
          <rect x="804" y="110" width="24" height="12" />
        </g>

        {/* Spider-web lines strung between rooftops */}
        <g>
          {/* Main web anchor lines from antenna top */}
          <line className="pixel-web-line" x1="816" y1="110" x2="548" y2="136" />
          <line className="pixel-web-line" x1="816" y1="110" x2="960" y2="164" />
          <line className="pixel-web-line" x1="816" y1="110" x2="712" y2="196" />
          {/* Shorter building-to-building web strands */}
          <line className="pixel-web-line" x1="254" y1="154" x2="414" y2="154" />
          <line className="pixel-web-line" x1="548" y1="136" x2="728" y2="196" />
          {/* Web anchor dots */}
          <rect className="pixel-web-anchor" x="812" y="106" width="8" height="8" />
          <rect className="pixel-web-anchor" x="544" y="132" width="8" height="8" />
          <rect className="pixel-web-anchor" x="724" y="192" width="8" height="8" />
          <rect className="pixel-web-anchor" x="250" y="150" width="8" height="8" />
          <rect className="pixel-web-anchor" x="410" y="150" width="8" height="8" />
        </g>

        {/* Spider-Man pixel-art web-slinger - swings on animation */}
        <g className="pixel-slinger-group">
          {/* Web strand from swing point */}
          <line className="pixel-web-line" x1="480" y1="136" x2="480" y2="200" />
          {/* Body - red suit */}
          <rect className="pixel-slinger-body" x="472" y="200" width="16" height="18" />
          {/* Head / mask */}
          <rect className="pixel-slinger-mask" x="474" y="190" width="12" height="12" />
          {/* Eyes - white lenses */}
          <rect className="pixel-slinger-eye" x="476" y="193" width="4" height="3" />
          <rect className="pixel-slinger-eye" x="482" y="193" width="4" height="3" />
          {/* Arms out-stretched */}
          <rect className="pixel-slinger-body" x="460" y="202" width="12" height="4" />
          <rect className="pixel-slinger-body" x="488" y="202" width="12" height="4" />
          {/* Web-shooting wrist lines */}
          <line className="pixel-web-line" x1="460" y1="204" x2="440" y2="180" />
          <line className="pixel-web-line" x1="500" y1="204" x2="520" y2="180" />
          {/* Legs */}
          <rect className="pixel-slinger-body" x="474" y="218" width="5" height="10" />
          <rect className="pixel-slinger-body" x="481" y="218" width="5" height="10" />
        </g>

        {/* Original robot replaced by hacker-bot */}
        <g className="pixel-bot">
          <rect x="146" y="288" width="52" height="42" />
          <rect x="154" y="276" width="36" height="12" />
          <rect x="138" y="298" width="8" height="20" />
          <rect x="198" y="298" width="8" height="20" />
          <rect x="154" y="330" width="10" height="18" />
          <rect x="180" y="330" width="10" height="18" />
          <rect className="pixel-bot-eye" x="158" y="296" width="8" height="8" />
          <rect className="pixel-bot-eye" x="178" y="296" width="8" height="8" />
        </g>
      </svg>
      <span className="pixel-world-label">WORLD_01 / ENGINEERING DISTRICT - WEB_SLINGER ACTIVE</span>
    </div>
  );
}
