import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Zap, HardDrive, Cpu, Wifi, MemoryStick } from 'lucide-react';

// Progress bar helper
function ProgressBar({ value, color = 'bg-blue-500', height = 'h-4' }: { value: number; color?: string; height?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${color} ${height} rounded-full transition-all duration-500`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

// Inline ASCII-style bar (for timeline display)
function AsciiBar({ value, total = 30 }: { value: number; total?: number }) {
  const filled = Math.round((value / 100) * total);
  const empty = total - filled;
  return (
    <span className="font-mono text-sm">
      [<span className="text-blue-600">{'█'.repeat(filled)}</span>
      <span className="text-gray-300">{'░'.repeat(empty)}</span>]
    </span>
  );
}

const TIMELINE_STEPS = [
  { time: 'T+0min', pct: 0, label: 'Inicio' },
  { time: 'T+5min', pct: 10 },
  { time: 'T+10min', pct: 20 },
  { time: 'T+15min', pct: 30 },
  { time: 'T+20min', pct: 40 },
  { time: 'T+25min', pct: 50 },
  { time: 'T+30min', pct: 60 },
  { time: 'T+35min', pct: 75 },
  { time: 'T+40min', pct: 80 },
  { time: 'T+45min', pct: 90 },
  { time: 'T+50min', pct: 95 },
  { time: 'T+55min', pct: 98 },
  { time: 'T+60min', pct: 100, label: '✅ COMPLETADO' },
];

const FILES = {
  workflows: [
    { name: '01-security-audit.yml', pct: 100, done: true },
    { name: '02-test-automation.yml', pct: 100, done: true },
    { name: '03-deploy-production.yml', pct: 100, done: true },
    { name: '04-anomaly-detection.yml', pct: 100, done: true },
    { name: '05-pr-validation.yml', pct: 100, done: true },
  ],
  migrations: [
    { name: '001-create-audit-trail.sql', pct: 75, done: false },
    { name: '002-create-error-logs.sql', pct: 75, done: false },
    { name: '003-create-rls-policies.sql', pct: 60, done: false },
    { name: '004-create-indexes.sql', pct: 60, done: false },
  ],
  docs: [
    { name: 'SECRETS_TEMPLATE.md', pct: 50, done: false },
    { name: 'SETUP_FINAL.md', pct: 30, done: false },
  ],
};

const COMPONENTS = [
  { label: 'Workflows YAML', pct: 80, color: 'bg-green-500' },
  { label: 'SQL Migrations', pct: 60, color: 'bg-yellow-500' },
  { label: 'Documentación', pct: 40, color: 'bg-orange-400' },
  { label: 'Setup & Validación', pct: 20, color: 'bg-red-400' },
];

// Simulate slow live progress increments for real-time feel
function useSimulatedProgress(initial: number, max: number, stepMs = 3000, increment = 0.5) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    if (value >= max) return;
    const id = setInterval(() => {
      setValue((v) => Math.min(max, +(v + increment).toFixed(1)));
    }, stepMs);
    return () => clearInterval(id);
  }, [value, max, stepMs, increment]);
  return value;
}

const PROGRESS_SPEED_PER_MINUTE = 2.5;

export function ProgressDashboard() {
  const totalProgress = useSimulatedProgress(75, 100, 2000, 0.3);
  const cpuUsage = useSimulatedProgress(80, 95, 1500, 0.5);
  const memoryUsage = useSimulatedProgress(70, 90, 2500, 0.4);
  const networkUsage = useSimulatedProgress(80, 95, 1800, 0.6);
  const diskUsage = useSimulatedProgress(50, 75, 3000, 0.3);

  const speed = PROGRESS_SPEED_PER_MINUTE;
  const eta = Math.ceil((100 - totalProgress) / speed);

  const [now, setNow] = useState(new Date());
  const tick = useCallback(() => setNow(new Date()), []);
  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">📊 Gráfico de Progreso — Infraestructura</h2>
        <span className="text-sm text-gray-500 font-mono">{now.toLocaleTimeString()}</span>
      </div>

      {/* 1. General progress */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">1. Progreso Total</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <ProgressBar value={totalProgress} color="bg-blue-500" height="h-6" />
          </div>
          <span className="text-2xl font-bold text-blue-600 w-16 text-right">{totalProgress.toFixed(1)}%</span>
        </div>
      </div>

      {/* 2. Breakdown by component */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">2. Desglose por Componente</h3>
        <div className="space-y-3">
          {COMPONENTS.map(({ label, pct, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-40 text-sm text-gray-700 font-medium">{label}</span>
              <div className="flex-1">
                <ProgressBar value={pct} color={color} />
              </div>
              <span className="w-12 text-sm font-semibold text-gray-700 text-right">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Timeline */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Timeline de Creación</h3>
        <div className="space-y-1 overflow-x-auto">
          {TIMELINE_STEPS.map(({ time, pct, label }) => (
            <div key={time} className="flex items-center gap-2 text-sm font-mono">
              <span className="w-16 text-gray-500">{time}</span>
              <AsciiBar value={pct} total={28} />
              <span className="w-8 text-gray-700 font-semibold text-right">{pct}%</span>
              {label && <span className="ml-2 text-green-600 font-semibold">{label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 4. File details */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">4. Detalle por Archivo (11 archivos total)</h3>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Workflows (5 archivos):</h4>
          <div className="space-y-2 pl-2">
            {FILES.workflows.map(({ name, pct, done }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-green-500">{done ? <CheckCircle className="w-4 h-4 inline" /> : <Clock className="w-4 h-4 inline text-yellow-500" />}</span>
                <span className="w-56 text-sm font-mono text-gray-700">{name}</span>
                <div className="flex-1">
                  <ProgressBar value={pct} color="bg-green-500" height="h-2" />
                </div>
                <span className="w-10 text-sm text-right font-semibold text-gray-600">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Migrations (4 archivos):</h4>
          <div className="space-y-2 pl-2">
            {FILES.migrations.map(({ name, pct, done }) => (
              <div key={name} className="flex items-center gap-3">
                <span>{done ? <CheckCircle className="w-4 h-4 inline text-green-500" /> : <Clock className="w-4 h-4 inline text-yellow-500" />}</span>
                <span className="w-56 text-sm font-mono text-gray-700">{name}</span>
                <div className="flex-1">
                  <ProgressBar value={pct} color="bg-yellow-500" height="h-2" />
                </div>
                <span className="w-10 text-sm text-right font-semibold text-gray-600">{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Documentación (2 archivos):</h4>
          <div className="space-y-2 pl-2">
            {FILES.docs.map(({ name, pct, done }) => (
              <div key={name} className="flex items-center gap-3">
                <span>{done ? <CheckCircle className="w-4 h-4 inline text-green-500" /> : <Clock className="w-4 h-4 inline text-yellow-500" />}</span>
                <span className="w-56 text-sm font-mono text-gray-700">{name}</span>
                <div className="flex-1">
                  <ProgressBar value={pct} color="bg-orange-400" height="h-2" />
                </div>
                <span className="w-10 text-sm text-right font-semibold text-gray-600">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Speed */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">5. Velocidad de Progreso</h3>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span className="text-gray-700">Velocidad actual:</span>
            <span className="font-bold text-blue-600">{speed}% por minuto</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">ETA final:</span>
            <span className="font-bold text-gray-800">~{eta} minutos más</span>
          </div>
        </div>
      </div>

      {/* 6. Status by category */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">6. Status por Categoría</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-green-500 font-bold">🟢 COMPLETADO:</span>
            <span className="text-gray-700 flex-1">Workflows YAML (5/5)</span>
            <div className="w-48">
              <ProgressBar value={100} color="bg-green-500" />
            </div>
            <span className="w-12 text-right font-semibold text-green-600">100%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-500 font-bold">🟡 EN PROGRESO:</span>
            <span className="text-gray-700 flex-1">SQL Migrations (4/4)</span>
            <div className="w-48">
              <ProgressBar value={67} color="bg-yellow-500" />
            </div>
            <span className="w-12 text-right font-semibold text-yellow-600">67%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-yellow-500 font-bold">🟡 EN PROGRESO:</span>
            <span className="text-gray-700 flex-1">Documentación (2/2)</span>
            <div className="w-48">
              <ProgressBar value={40} color="bg-orange-400" />
            </div>
            <span className="w-12 text-right font-semibold text-orange-500">40%</span>
          </div>
        </div>
      </div>

      {/* 7. Execution metrics */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">7. Métricas de Ejecución</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-gray-700">CPU Usage</span>
              <span className="ml-auto text-sm font-bold text-red-600">{cpuUsage.toFixed(0)}%</span>
            </div>
            <ProgressBar value={cpuUsage} color="bg-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MemoryStick className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Memory</span>
              <span className="ml-auto text-sm font-bold text-purple-600">{memoryUsage.toFixed(0)}%</span>
            </div>
            <ProgressBar value={memoryUsage} color="bg-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Network</span>
              <span className="ml-auto text-sm font-bold text-blue-600">{networkUsage.toFixed(0)}%</span>
            </div>
            <ProgressBar value={networkUsage} color="bg-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Disk I/O</span>
              <span className="ml-auto text-sm font-bold text-gray-600">{diskUsage.toFixed(0)}%</span>
            </div>
            <ProgressBar value={diskUsage} color="bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
