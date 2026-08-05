'use client';

import { logoutAdmin } from '../actions';

export function LogoutButton() {
  return (
    <button
      onClick={() => logoutAdmin()}
      className="flex w-full items-center space-x-3 px-3 py-2 text-sm text-rose-500 hover:text-rose-600 transition-colors text-left"
    >
      <span>Logout</span>
    </button>
  );
}
