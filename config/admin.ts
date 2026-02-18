function getPreviewPathname(uid: string, { locale, document }: { locale?: string; document?: Record<string, unknown> }) {
  switch (uid) {
    case 'api::homepage.homepage':
      return '/';
    case 'api::page.page':
      return document?.slug ? `/${document.slug as string}` : null;
    case 'api::legal-page.legal-page':
      return document?.slug ? `/legal/${document.slug as string}` : null;
    case 'api::article.article':
      return document?.slug ? `/slots/${document.slug as string}` : null;
    default:
      return null;
  }
}

export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL', 'https://anthosaure-git-dev-maxime-saltets-projects.vercel.app'),
      async handler(uid, { documentId, locale, status }) {
        const document = await strapi.documents(uid).findOne({ documentId });
        const pathname = getPreviewPathname(uid, { locale, document });

        if (!pathname) return null;

        const secret = env('STRAPI_DRAFT_SECRET', '');
        return `${env('CLIENT_URL', 'https://anthosaure-git-dev-maxime-saltets-projects.vercel.app')}/api/draft/enable?secret=${secret}&slug=${pathname}`;
      },
    },
  },
});
