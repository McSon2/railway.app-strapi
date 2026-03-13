const GAME_SLUGS = new Set(['blackjack', 'plinko', 'jackpot', 'paris-sportifs', 'nolimit-slots']);

/** Map Strapi locale to URL prefix */
function getLocalePrefix(locale?: string): string {
  if (!locale || locale === 'fr') return '';
  // fr-CA → /fr-ca
  return `/${locale.toLowerCase()}`;
}

function getPreviewPathname(uid: string, { locale, document }: { locale?: string; document?: Record<string, unknown> }) {
  const prefix = getLocalePrefix(locale);
  switch (uid) {
    case 'api::homepage.homepage':
      return `${prefix}/`;
    case 'api::page.page': {
      const slug = document?.slug as string | undefined;
      if (!slug) return null;
      if (GAME_SLUGS.has(slug)) return `${prefix}/games/${slug}`;
      return `${prefix}/${slug}`;
    }
    case 'api::legal-page.legal-page':
      return document?.slug ? `${prefix}/legal/${document.slug as string}` : null;
    case 'api::article.article':
      return document?.slug ? `${prefix}/slots/${document.slug as string}` : null;
    case 'api::blog-post.blog-post':
      return document?.slug ? `${prefix}/blog/${document.slug as string}` : null;
    case 'api::guide.guide':
      return document?.slug ? `${prefix}/guides/${document.slug as string}` : null;
    case 'api::stake-page.stake-page':
      return document?.slug ? `${prefix}/stake/${document.slug as string}` : null;
    case 'api::provider.provider':
      return document?.slug ? `${prefix}/fournisseurs/${document.slug as string}` : null;
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
        const document = await strapi.documents(uid).findOne({ documentId, locale });
        const pathname = getPreviewPathname(uid, { locale, document });

        if (!pathname) return null;

        const secret = env('STRAPI_DRAFT_SECRET', '');
        return `${env('CLIENT_URL', 'https://anthosaure-git-dev-maxime-saltets-projects.vercel.app')}/api/draft/enable?secret=${secret}&slug=${pathname}`;
      },
    },
  },
});
