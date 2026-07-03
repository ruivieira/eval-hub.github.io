/// <reference types="astro/client" />

declare module 'virtual:starlight-blog/config' {
  const config: { title?: string | Record<string, string> };
  export default config;
}

declare module 'virtual:@pasqal-io/starlight-client-mermaid' {
  const config: { className: string };
  export default config;
}

interface Window {
  __mermaidClassName: string;
}
