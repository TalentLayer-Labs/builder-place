import { IBuilderPlace } from './types';

export const getSeoDefaultConfig = (builderPlace: IBuilderPlace) => {
  if (!builderPlace) {
    const title = 'BuilderPlace';
    const description = 'Empower opens-source contributors to help you achieve your goals';
    const canonical = 'https://builder.place';

    return {
      title,
      description,
      canonical,
      openGraph: {
        type: 'website',
        locale: 'en_US',
        site_name: 'BuilderPlace',
        title,
        description,
      },
    };
  }

  const title = `${builderPlace.name} BuilderPlace`;
  const description = `${builderPlace.baseline}`;

  const config = {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      site_name: title,
      title,
      description,
      images: [],
    },
    additionalLinkTags: [
      {
        rel: 'manifest',
        href: '/api/manifest',
      },
    ],
  };

  if (builderPlace.cover) {
    // @ts-ignore
    config.openGraph.images.push({
      url: builderPlace.cover,
      width: 800,
      height: 600,
      alt: builderPlace.name,
    });
  } else if (builderPlace.logo) {
    // @ts-ignore
    config.openGraph.images.push({
      url: builderPlace.logo,
      width: 400,
      height: 300,
      alt: builderPlace.name,
    });
  }

  return config;
};
