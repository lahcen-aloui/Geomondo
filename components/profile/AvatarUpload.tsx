'use client';

import { useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';

interface Props {
  userId: string;
  username: string;
  currentAvatarUrl: string | null;
}

export default function AvatarUpload({ userId, username, currentAvatarUrl }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const avatarUrl = preview ?? currentAvatarUrl;

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Seleziona un file immagine.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Il file deve essere inferiore a 2 MB.');
      return;
    }

    setError(null);
    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);
    try {
      const supabase = createClient();

      // Use userId as filename to overwrite on update
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);

      // Add cache-busting timestamp
      const urlWithTs = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTs })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreview(urlWithTs);
      startTransition(() => router.refresh());
    } catch (err) {
      setError('Caricamento fallito. Riprova.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="relative flex-shrink-0 group" onDrop={onDrop} onDragOver={e => e.preventDefault()}>
      {/* Avatar circle */}
      <div
        className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-it-green/20 cursor-pointer"
        onClick={() => inputRef.current?.click()}
        title="Cambia foto profilo"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={username}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-it-green flex items-center justify-center text-white font-black text-3xl uppercase select-none">
            {username[0]}
          </div>
        )}
      </div>

      {/* Camera overlay on hover */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
        aria-label="Cambia foto profilo"
      >
        {uploading ? (
          <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onInputChange}
      />

      {/* Error tooltip */}
      {error && (
        <p className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-red-400 bg-surface border border-border rounded-lg px-3 py-1.5 shadow-lg z-10">
          {error}
        </p>
      )}
    </div>
  );
}
