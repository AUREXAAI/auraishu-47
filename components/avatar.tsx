'use client';

import { useAuth } from '@/lib/auth-context';

export default function Avatar({ onClick }: { onClick?: () => void }) {
  const { user } = useAuth();
  const photoURL = user?.photoURL;
  const displayName = user?.displayName || 'User';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <button onClick={onClick} className="h-9 w-9 overflow-hidden rounded-full border border-[#262640] transition-transform active:scale-95">
      {photoURL ? (
        <img src={photoURL} alt={displayName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-sm font-bold text-white">
          {initials}
        </div>
      )}
    </button>
  );
}
