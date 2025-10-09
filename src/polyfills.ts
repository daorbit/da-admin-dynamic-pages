// Polyfills for Node.js globals
if (typeof window !== 'undefined') {
  window.global = window.global || window;
  window.process = window.process || { env: {} };

  // Define require function for CommonJS modules
  window.require = window.require || function(id: string) {
    if (id === 'jquery') {
      return (window as any).jQuery || (window as any).$;
    }
    throw new Error(`Module '${id}' not found`);
  };
}

export {};