"use client";

import React from 'react'
import Image from 'next/image'
import { useAuth } from '../lib/hooks/useAuth';

export default function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
    >
      <Image
        src="https://www.google.com/favicon.ico"
        alt="Google logo"
        width={20}
        height={20}
        unoptimized
      />
      Sign in with Google
    </button>
  );
}
