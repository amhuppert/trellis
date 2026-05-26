/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_REPORT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
