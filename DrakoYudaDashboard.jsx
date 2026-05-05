import React, { useState } from 'react';

const DrakoYudaDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      message: 'Dashboard initialized',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const addLog = (message) => {
    const newLog = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString(),
    };

    setActivityLog((prev) => [newLog, ...prev]);
  };

  const handleRunTest = () => {
    if (isRunning) return;

    setIsRunning(true);
    addLog('Test execution started');

    setTimeout(() => {
      setIsRunning(false);
      addLog('Test execution completed successfully');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-[#2D5F3F]/20 pb-4">
          <h1 className="text-3xl font-bold text-[#2D5F3F]">DrakoYuda Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Execution Lab Control Center</p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[#2D5F3F]/20 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Status</h2>
            <div className="mt-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-lg font-semibold text-[#2D5F3F]">Active</span>
            </div>
          </article>

          <article className="rounded-xl border border-[#2D5F3F]/20 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Metrics</h2>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-[#2D5F3F]">Execution Time:</span> 242ms
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium text-[#2D5F3F]">Success Rate:</span> 98.5%
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-[#2D5F3F]/20 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Actions</h2>
            <button
              type="button"
              onClick={handleRunTest}
              disabled={isRunning}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRunning ? 'Running...' : 'Run Test'}
            </button>
          </article>
        </section>

        <section className="mt-8 rounded-xl border border-[#2D5F3F]/20 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Activity Log</h2>
          <ul className="mt-4 space-y-2">
            {activityLog.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                <span className="text-gray-700">{event.message}</span>
                <span className="font-mono text-xs text-[#2D5F3F]">{event.timestamp}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DrakoYudaDashboard;
