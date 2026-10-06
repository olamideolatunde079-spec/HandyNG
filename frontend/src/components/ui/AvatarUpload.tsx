'use client';

import { useRef, useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface AvatarUploadProps {
  currentUrl?: string | null;
  name: string;
  onUpload: (file: File) => Promise<void>;
  size?: number; // px, default 96
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export default function AvatarUpload({ currentUrl, name, onUpload, size = 96 }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    if (!ALLOWED.includes(file.type)) {
      setError('Only JPEG, PNG or WEBP images are allowed');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be 2 MB or smaller');
      return;
    }

    // Show instant local preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  const displayUrl = preview ?? currentUrl;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <div
        className="relative rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt={`${name} avatar`}
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        ) : (
          <span
            className="font-bold text-emerald-700 select-none"
            style={{ fontSize: size * 0.35 }}
          >
            {initials}
          </span>
        )}

        {/* Upload overlay */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Upload new photo"
          className="absolute inset-0 flex items-center justify-center bg-black/40
                     opacity-0 hover:opacity-100 transition-opacity rounded-full
                     focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {uploading ? (
            <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 text-white animate-spin" />
          ) : (
            <FontAwesomeIcon icon={faCamera} className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
      />

      {/* Change photo button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs font-medium text-emerald-600 hover:underline disabled:opacity-50"
      >
        {uploading ? 'Uploading…' : 'Change photo'}
      </button>

      {/* Error */}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-400">JPEG, PNG or WEBP · Max 2 MB</p>
    </div>
  );
}
