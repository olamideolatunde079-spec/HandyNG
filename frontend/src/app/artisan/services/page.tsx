'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthToken } from '@/hooks/useAuthToken';
import { fetchMyServices, createService, deleteService } from '@/services/artisanServices';
import { fetchCategories } from '@/services/categories';
import { Service, ServiceCategory } from '@/types/database';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlus,
  faTrash,
  faPenToSquare,
  faBriefcase,
} from '@fortawesome/free-solid-svg-icons';

// ── Pricing label helper ───────────────────────────────────────

const PRICING_LABELS: Record<string, string> = {
  fixed: 'Fixed price',
  starting_from: 'Starting from',
  negotiable: 'Negotiable',
  inspection_required: 'After inspection',
};

// ── Add-service form ───────────────────────────────────────────

interface AddFormState {
  category_id: string;
  name: string;
  description: string;
  pricing_type: 'fixed' | 'starting_from' | 'negotiable' | 'inspection_required';
  price_from: string;
  price_to: string;
}

const EMPTY_FORM: AddFormState = {
  category_id: '',
  name: '',
  description: '',
  pricing_type: 'negotiable',
  price_from: '',
  price_to: '',
};

function AddServiceForm({
  categories,
  onSave,
  onCancel,
}: {
  categories: ServiceCategory[];
  onSave: (s: Service) => void;
  onCancel: () => void;
}) {
  const token = useAuthToken();
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof AddFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.category_id) {
      setError('Please select a category');
      return;
    }
    if (!form.name.trim()) {
      setError('Service name is required');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const created = await createService(token, {
        category_id: form.category_id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        pricing_type: form.pricing_type,
        price_from: form.price_from ? Number(form.price_from) : null,
        price_to: form.price_to ? Number(form.price_to) : null,
        is_active: true,
      });
      onSave(created);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex flex-col gap-4"
    >
      <h3 className="text-sm font-semibold text-gray-900">Add new service</h3>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={form.category_id}
          onChange={set('category_id')}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm
                     focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
        >
          <option value="">Select a category…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Service name"
        type="text"
        required
        value={form.name}
        onChange={set('name')}
        placeholder="e.g. House rewiring"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={set('description')}
          placeholder="What does this service include?"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
                     focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2
                     focus:ring-emerald-100 transition resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Pricing</label>
          <select
            value={form.pricing_type}
            onChange={set('pricing_type')}
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm
                       focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition"
          >
            <option value="negotiable">Negotiable</option>
            <option value="fixed">Fixed</option>
            <option value="starting_from">Starting from</option>
            <option value="inspection_required">After inspection</option>
          </select>
        </div>
        <Input
          label="Price from (₦)"
          type="number"
          min="0"
          value={form.price_from}
          onChange={set('price_from')}
          placeholder="0"
        />
        <Input
          label="Price to (₦)"
          type="number"
          min="0"
          value={form.price_to}
          onChange={set('price_to')}
          placeholder="Optional"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 transition"
        >
          Cancel
        </button>
        <Button type="submit" loading={saving} disabled={!token}>
          Add service
        </Button>
      </div>
    </form>
  );
}

// ── Service row ────────────────────────────────────────────────

function ServiceRow({
  service,
  onDelete,
}: {
  service: Service & { service_categories?: { name: string; icon: string | null } | null };
  onDelete: (id: string) => void;
}) {
  const token = useAuthToken();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!token || !confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteService(token, service.id);
      onDelete(service.id);
    } catch {
      /* error shown via alert in parent */
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100
                    bg-white p-4 shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{service.name}</p>
          {!service.is_active && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              Inactive
            </span>
          )}
        </div>
        {service.service_categories && (
          <p className="text-xs text-gray-500 mt-0.5">{service.service_categories.name}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          {PRICING_LABELS[service.pricing_type]}
          {service.price_from != null && ` · ₦${Number(service.price_from).toLocaleString()}`}
          {service.price_to != null && ` – ₦${Number(service.price_to).toLocaleString()}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDelete}
          disabled={deleting}
          aria-label={`Delete ${service.name}`}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500
                     disabled:opacity-50 transition"
        >
          {deleting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent block" />
          ) : (
            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function ArtisanServicesPage() {
  useRequireAuth('artisan');
  const token = useAuthToken();

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchMyServices(token), fetchCategories()])
      .then(([svcs, cats]) => {
        setServices(svcs);
        setCategories(cats);
      })
      .catch((err) => setPageError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token]);

  function handleAdded(service: Service) {
    setServices((prev) => [service, ...prev]);
    setShowForm(false);
  }

  function handleDeleted(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const active = services.filter((s) => s.is_active);
  const inactive = services.filter((s) => !s.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/artisan/dashboard"
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">My services</h1>
          </div>
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            Add service
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 flex flex-col gap-5">
        {pageError && <Alert variant="error">{pageError}</Alert>}

        {/* Add form */}
        {showForm && (
          <AddServiceForm
            categories={categories}
            onSave={handleAdded}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Active services */}
        {active.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Active ({active.length})
            </h2>
            <div className="flex flex-col gap-3">
              {active.map((s) => (
                <ServiceRow key={s.id} service={s as never} onDelete={handleDeleted} />
              ))}
            </div>
          </section>
        )}

        {/* Inactive services */}
        {inactive.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Inactive ({inactive.length})
            </h2>
            <div className="flex flex-col gap-3 opacity-60">
              {inactive.map((s) => (
                <ServiceRow key={s.id} service={s as never} onDelete={handleDeleted} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {services.length === 0 && !showForm && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-14 text-center">
            <FontAwesomeIcon icon={faBriefcase} className="mx-auto h-10 w-10 text-gray-200 mb-4" />
            <p className="text-sm font-medium text-gray-500">No services yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">
              Add your first service so customers can find you.
            </p>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
              Add your first service
            </Button>
          </div>
        )}

        {/* Edit hint */}
        {services.length > 0 && (
          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
            Full service editing coming in a future update.
          </p>
        )}
      </main>
    </div>
  );
}
