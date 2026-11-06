'use client';

import React from 'react';

type Props = {
children: React.ReactNode;
};

type State = {
hasError: boolean;
message: string;
};

export default class ClientErrorBoundary extends React.Component<Props, State> {
state: State = {
hasError: false,
message: '',
};

static getDerivedStateFromError(error: Error): State {
return {
hasError: true,
message: error?.message || 'Unknown client-side error',
};
}

componentDidCatch(error: Error, info: React.ErrorInfo) {
console.error('AUREXA AI Runtime Error:', error);
console.error('Component Stack:', info.componentStack);
}

render() {
if (this.state.hasError) {
return (
<main className="flex min-h-screen items-center justify-center bg-[#090817] p-6 text-white">
<div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-[#151126] p-6">
<h1 className="text-xl font-bold text-red-400">
AUREXA AI Runtime Error
</h1>

        <p className="mt-4 text-sm text-[#c9c2dc]">
          Error message:
        </p>

        <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/30 p-4 text-sm text-red-300">
          {this.state.message}
        </pre>

        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Reload AUREXA AI
        </button>
      </div>
    </main>
  );
}

return this.props.children;

}
}
