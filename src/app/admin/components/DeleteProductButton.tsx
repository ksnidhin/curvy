'use client'

import { useTransition } from 'react';
import { deleteProduct } from '../actions';

export function DeleteProductButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button 
      onClick={() => {
        if (confirm("Are you sure you want to delete this product?")) {
          startTransition(() => {
            deleteProduct(id);
          });
        }
      }}
      disabled={isPending}
      className="text-red-500 hover:text-red-600 font-medium disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
