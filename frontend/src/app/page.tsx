import { api, ApiRequestError } from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────

interface HealthData {
  timestamp: string;
  environment: string;
}

// ── Server-side data fetch ─────────────────────────────────────

async function getApiHealth(): Promise<{ ok: boolean; message: string; data?: HealthData }> {
  try {
    const res = await api.get<HealthData>('/api/v1/health');
    return { ok: true, message: res.message, data: res.data };
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return { ok: false, message: err.message };
    }
    return { ok: false, message: 'Could not reach the API' };
  }
}

// ── Page ───────────────────────────────────────────────────────

export default async function Home() {
  const health = await getApiHealth();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full">
        {/* Logo / title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1">HandyNG</h1>
        <p className="text-gray-500 text-sm mb-8">
          Local Artisan &amp; Trusted Services Marketplace
        </p>

        {/* API status card */}
        <div
          className={`rounded-xl p-4 flex items-start gap-3 ${
            health.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <span className={`mt-0.5 text-lg ${health.ok ? 'text-green-600' : 'text-red-500'}`}>
            {health.ok ? '✓' : '✗'}
          </span>
          <div>
            <p className={`text-sm font-semibold ${health.ok ? 'text-green-800' : 'text-red-700'}`}>
              {health.ok ? 'API Connected' : 'API Unreachable'}
            </p>
            <p className={`text-xs mt-0.5 ${health.ok ? 'text-green-700' : 'text-red-600'}`}>
              {health.message}
            </p>
            {health.data && (
              <p className="text-xs text-green-600 mt-1">
                {health.data.environment} · {new Date(health.data.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Phase indicator */}
        <p className="text-xs text-gray-400 mt-6 text-center">Phase 1 — Basic Application Setup</p>
      </div>
    </main>
  );
}
