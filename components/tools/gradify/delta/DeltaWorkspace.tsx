'use client';

import { useEffect, useState } from 'react';
import { GpaProvider, useGpa } from './context/GpaContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import CalculatorTab from './components/CalculatorTab';
import PlannerTab from './components/PlannerTab';

function DeltaContent() {
  const { activeTab, setActiveTab } = useGpa();
  const [plannerOpened, setPlannerOpened] = useState(false);
  useEffect(() => {
    if (activeTab === 'planner') setPlannerOpened(true);
  }, [activeTab]);

  return (
    <div id="gradify-delta" className="space-y-6 text-slate-800 lining-nums" style={{ fontVariantNumeric: 'lining-nums tabular-nums' }}>
      <ErrorBoundary><Header /></ErrorBoundary>
      <div className="flex overflow-x-auto border-b border-slate-300" role="tablist" aria-label="Delta planning tools">
        {([
          ['calculator', 'Semester calculator'],
          ['planner', 'Graduation planner'],
        ] as const).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`delta-tab-${tab}`}
            aria-controls={`delta-panel-${tab}`}
            aria-selected={activeTab === tab}
            className={`shrink-0 px-4 py-3 text-sm font-bold transition-colors sm:px-6 ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab(tab)}
          >{label}</button>
        ))}
      </div>
      <section id="delta-panel-calculator" role="tabpanel" aria-labelledby="delta-tab-calculator" style={{ display: activeTab === 'calculator' ? undefined : 'none' }}>
        <ErrorBoundary><CalculatorTab /></ErrorBoundary>
      </section>
      {(plannerOpened || activeTab === 'planner') && (
        <section id="delta-panel-planner" role="tabpanel" aria-labelledby="delta-tab-planner" style={{ display: activeTab === 'planner' ? undefined : 'none' }}>
          <ErrorBoundary><PlannerTab /></ErrorBoundary>
        </section>
      )}
      <ToastContainer />
    </div>
  );
}

export default function DeltaWorkspace() {
  return <ToastProvider><GpaProvider><DeltaContent /></GpaProvider></ToastProvider>;
}
