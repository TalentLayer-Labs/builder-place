/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https' + process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
};
