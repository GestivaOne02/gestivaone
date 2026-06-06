declare module "jsr:@supabase/functions-js/edge-runtime.d.ts" {
  // This module is a special Supabase Functions runtime helper imported for side effects.
  // We declare it here only for TypeScript tooling in VS Code.
  export {};
}

declare namespace Deno {
  const env: {
    get(name: string): string | undefined
  }

  function serve(
    handler: (req: Request) => Response | Promise<Response>,
  ): void
}
