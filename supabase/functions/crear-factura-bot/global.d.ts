declare module "jsr:@supabase/functions-js/edge-runtime.d.ts" {
  // Este módulo es un helper especial de Supabase Functions runtime.
  // Lo declaramos para que el tipado de TypeScript en VS Code no marque errores.
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
