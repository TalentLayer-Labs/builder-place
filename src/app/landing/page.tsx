import { IntroducationSecion } from '../../components/introduction-section';

export default function HomePage() {
  return (
    <>
      <section id='home' className='pt-[100px] md:pt-[200px] lg:pt-[120px]'>
        <div className='container lg:max-w-[1305px] lg:px-10'>
          <div className='-mx-4 flex flex-wrap items-center'>
            <div className='w-full px-4  lg:w-5/12 mb-20'>
              <div className='fadeInUp mb-12 lg:mb-0 lg:max-w-[570px]' data-wow-delay='.2s'>
                <h1 className='text-center mb-6 text-3xl md:text-5xl font-bold leading-tight text-black  sm:text-[50px] md:text-[60px] lg:text-[50px] lext-left xl:text-[70px] md:text-left'>
                  grow your<br></br>
                  <span className='inline bg-landingprimary bg-clip-text text-transparent'>
                    open-source movement{' '}
                  </span>
                  today
                </h1>
                <p className='mb-10 first-letter:max-w-[475px] text-base leading-relaxed text-body text-center md:text-left'>
                  BuilderPlace is your open-source community management platform + contributor
                  discovery engine
                </p>

                <div className='flex justify-center md:justify-start gap-4'>
                  <a
                    href='/newonboarding/create-profile'
                    className='max-w-[186px] flex-1 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-medium text-white font-bold hover:bg-opacity-60'>
                    create a <br />
                    BuilderPlace
                  </a>
                  {/* <a
                      href='#'
                      className='max-w-[186px] flex-1 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-medium text-white font-bold hover:bg-opacity-60'>
                      register for<br></br> beta
                    </a> */}
                  <a
                    href='/worker-landing'
                    className='max-w-[186px] flex-1 text-center rounded-md bg-redpraha py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-medium text-stone-800 font-bold hover:bg-opacity-60'>
                    contribute to <br />
                    projects
                  </a>
                </div>
                <div className='w-full px-4  pb-10 pt-5 sm:pb-40 block md:hidden lg:hidden'>
                  <div
                    className='wow fadeInUp relative z-10 mx-auto w-full max-w-[300px] pt-8 lg:mr-0'
                    data-wow-delay='.3s'>
                    <img src='/images/arrow.png' alt='hero image' />
                  </div>
                </div>
              </div>
            </div>

            <div className='w-full pt-4  pr-20 pb-10 lg:w-7/12 sm:pb-32 hidden lg:block'>
              <div
                className='wow fadeInUp relative z-10 mx-auto w-full max-w-[430px] pt-8 md:pt-12 lg:mr-0'
                data-wow-delay='.3s'>
                <img src='/images/arrow.png' alt='hero image' />
              </div>
            </div>
          </div>
        </div>
      </section>

      <IntroducationSecion />

      <section id='features' className='relative lg:pt-[110px]'>
        <div className='container'>
          <div
            className='wow fadeInUp mx-auto mb-14 max-w-[740px] text-center lg:mb-[70px]'
            data-wow-delay='.2s'>
            <h2 className='mb-4 text-3xl font-bold text-black  sm:text-4xl pt-10 md:text-[44px] leading-tight'>
              what's included in <br></br>your{' '}
              <span className='text-landingprimary'>BuilderPlace</span>?
            </h2>
            <p className='text-base text-body'>
              your BuilderPlace helps you kick-start and grow your own passionate community of
              open-source contributors. access tools that help new contributors discover you, learn
              your stack, and complete important work tasks.
            </p>
          </div>
        </div>

        <div className='container max-w-[1390px]'>
          <div className='rounded-2xl bg-white px-5 pt-10 pb-10 md:pb-1 lg:pt-14 lg:pb-5 xl:px-10'>
            <div className='-mx-4 flex flex-wrap justify-center'>
              <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                <div
                  className='wow fadeInUp group mx-auto mb-[60px] max-w-[510px] text-center'
                  data-wow-delay='.3s'>
                  <div className='mx-auto mb-8 flex h-[250px] w-[300px] items-center justify-center rounded-3 bg-opacity-20 text-redpraha duration-300   '>
                    <img
                      src='/images/myplace.png'
                      alt='about image'
                      className='mx-auto max-w-full'
                    />
                  </div>
                  <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                    the place
                  </h3>
                  <p className='text-base mx-auto max-w-[400px] mx-auto text-body pb-5'>
                    a branded open-source contribution center for your community, hosted on your
                    domain or yourname.builder.place
                  </p>
                </div>
              </div>
              <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                <div
                  className='wow fadeInUp group mx-auto mb-[60px] max-w-[510px] text-center'
                  data-wow-delay='.2s'>
                  <div className='mx-auto mb-8 flex h-[250px] w-[300px] items-center justify-center rounded-3 bg-opacity-20 text-redpraha duration-300   '>
                    <img
                      src='/images/iframe.png'
                      alt='about image'
                      className='mx-auto max-w-full'
                    />
                  </div>
                  <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                    the embed
                  </h3>
                  <p className='text-base text-body max-w-[400px] mx-auto pb-5'>
                    an embedable work board, perfect for putting on your team's current jobs page
                  </p>
                </div>
              </div>

              <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                <div
                  className='wow fadeInUp group mx-auto mb-[60px] max-w-[510px] text-center'
                  data-wow-delay='.4s'>
                  <div className='mx-auto mb-8 flex h-[250px] w-[300px] items-center justify-center rounded-3 bg-opacity-20 text-redpraha duration-300   '>
                    <img
                      src='/images/review.png'
                      alt='about image'
                      className='mx-auto max-w-full'
                    />
                  </div>
                  <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                    the tools
                  </h3>
                  <p className='text-base text-body pb-5 mx-auto max-w-[400px]'>
                    evaluate contributors with proposals and reviews, make payments with escrow
                  </p>
                </div>
              </div>
              <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                <div
                  className='wow fadeInUp group mx-auto mb-[60px] max-w-[510px] text-center'
                  data-wow-delay='.4s'>
                  <div className='mx-auto mb-8 flex h-[250px] w-[300px] items-center justify-center rounded-3 bg-opacity-20 text-redpraha duration-300   '>
                    <img
                      src='/images/network.png'
                      alt='about image'
                      className='mx-auto max-w-full'
                    />
                  </div>
                  <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                    the network
                  </h3>
                  <p className='text-base text-body pb-5 mx-auto max-w-[400px]'>
                    your work posts are automatically shared across a network of platforms where
                    people are searching for open-source projects to help
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='absolute -top-28 left-0 -z-10 hidden md:block'>
          <svg
            width='632'
            height='1179'
            viewBox='0 0 632 1179'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <g opacity='0.25' filter='url(#filter0_f_38_24)'>
              <circle cx='42.5' cy='589.5' r='329.5' fill='url(#paint0_linear_38_24)' />
            </g>
            <defs>
              <filter
                id='filter0_f_38_24'
                x='-547'
                y='0'
                width='1179'
                height='1179'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'>
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feGaussianBlur stdDeviation='130' result='effect1_foregroundBlur_38_24' />
              </filter>
              <linearGradient
                id='paint0_linear_38_24'
                x1='-366.218'
                y1='919'
                x2='451.176'
                y2='349.901'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#8EA5FE' />
                <stop offset='0.541667' stopColor='#BEB3FD' />
                <stop offset='1' stopColor='#90D1FF' />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className='absolute right-0 top-20 -z-10'>
          <svg
            width='637'
            height='1277'
            viewBox='0 0 637 1277'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <g opacity='0.2' filter='url(#filter0_f_38_23)'>
              <circle cx='638.5' cy='638.5' r='388.5' fill='url(#paint0_linear_38_23)' />
            </g>
            <defs>
              <filter
                id='filter0_f_38_23'
                x='0'
                y='0'
                width='1277'
                height='1277'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'>
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feGaussianBlur stdDeviation='125' result='effect1_foregroundBlur_38_23' />
              </filter>
              <linearGradient
                id='paint0_linear_38_23'
                x1='250'
                y1='250'
                x2='1168.59'
                y2='782.957'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#FF8FE8' />
                <stop offset='1' stopColor='#FFC960' />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      <section id='work-process' className='relative lg:pt-[110px]'>
        <div className='container'>
          <div
            className='wow fadeInUp mx-auto mb-5 max-w-[740px] text-center lg:mb-[30px]'
            data-wow-delay='.2s'>
            <h2 className='mb-0 mt-10 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
              teams like yours are shipping faster thanks to{' '}
              <span className='text-landingprimary'>open-source contributors</span>
            </h2>
          </div>
        </div>

        <div className='container max-w-[1390px]'>
          <div className='rounded-2xl bg-white px-5 pt-10 pb-10 md:pb-1 lg:pt-14 lg:pb-5 xl:px-10'>
            <div className='-mx-4 flex flex-wrap justify-center'>
              <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                <div
                  className='wow fadeInUp group mx-auto max-w-[510px] text-center pt-4 pb-1 wow fadeInUp mb-[50px] bg-redpraha bg-opacity-60 shadow-lg hover:bg-opacity-20 rounded-3xl'
                  data-wow-delay='.3s'>
                  <div className='mx-auto mb-4 flex h-[230px] w-[250px] items-center justify-center bg-opacity-20 text-redpraha duration-300   '>
                    <img
                      src='/images/talentlayer.png'
                      alt='about image'
                      className='mx-auto max-w-full'
                    />
                  </div>
                  <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                    TalentLayer
                  </h3>
                  <p className='text-base text-body pb-5 px-5'>
                    an API and infra layer for marketplace platforms
                  </p>
                  <div className='flex justify-center gap-4'>
                    <a
                      href='https://talentlayer.builder.place'
                      target='_blank'
                      className='max-w-[300px] flex-1 mb-5 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base text-white font-bold hover:bg-opacity-60'>
                      talentlayer.builder.place
                    </a>
                  </div>
                  {/* <a
                      href='https://www.talentlayer.org'
                      target='_blank'
                      className='max-w-[210px] flex-1 mb-5 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base text-white font-bold hover:bg-opacity-60'>
                      meet the project
                    </a> */}
                </div>
              </div>
              {/* <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                  <div
                    className='wow fadeInUp group mx-auto max-w-[510px] text-center pt-4 pb-1 wow fadeInUp mb-[50px] bg-redpraha bg-opacity-60 shadow-lg hover:bg-opacity-20 rounded-3xl'
                    data-wow-delay='.3s'>
                    <div className='mx-auto mb-4 flex h-[230px] w-[250px] items-center justify-center bg-opacity-20 text-redpraha duration-300   '>
                      <img
                        src='/images/workx.png'
                        alt='about image'
                        className='mx-auto max-w-full'
                      />
                    </div>
                    <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                      WorkX
                    </h3>
                    <p className='text-base text-body pb-5 px-5'>
                      an AI powered hiring network and marketplace
                    </p>
                    <div className='flex justify-center gap-4'>
                      <a
                        href='#'
                        className='max-w-[250px] flex-1 mb-5 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base text-white font-bold hover:bg-opacity-60'>
                        workx.builder.place
                      </a>
                    </div>
                  </div>
                </div> */}
              <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                <div
                  className='wow fadeInUp group mx-auto max-w-[510px] text-center pt-4 pb-1 wow fadeInUp mb-[50px] bg-redpraha bg-opacity-60 shadow-lg hover:bg-opacity-20 rounded-3xl'
                  data-wow-delay='.3s'>
                  <div className='mx-auto mb-4 flex h-[230px] w-[250px] items-center justify-center bg-opacity-20 text-redpraha duration-300   '>
                    <img
                      src='/images/thebadge.png'
                      alt='about image'
                      className='mx-auto max-w-full'
                    />
                  </div>
                  <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                    The Badge
                  </h3>
                  <p className='text-base text-body pb-5 px-5'>
                    a peer-to-peer information curation and attestation protocol
                  </p>
                  <div className='flex justify-center gap-4'>
                    <a
                      href='https://thebadge.builder.place'
                      target='_blank'
                      className='max-w-[300px] flex-1 mb-5 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base text-white font-bold hover:bg-opacity-60'>
                      thebadge.builder.place
                    </a>
                    {/* <a
                        href='https://www.thebadge.xyz'
                        target='_blank'
                        className='max-w-[210px] flex-1 mb-5 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base text-white font-bold hover:bg-opacity-60'>
                        meet the project
                      </a> */}
                  </div>
                </div>
              </div>
              {/* <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                  <div
                    className='wow fadeInUp group mx-auto max-w-[510px] text-center pt-4 pb-1 wow fadeInUp mb-[50px] rounded-lg bg-redpraha bg-opacity-60 shadow-lg hover:bg-opacity-20'
                    data-wow-delay='.3s'>
                    <div className='mx-auto mb-4 flex h-[230px] w-[250px] items-center justify-center bg-opacity-20 text-redpraha duration-300   '>
                      <img
                        src='/images/brian.png'
                        alt='about image'
                        className='mx-auto max-w-full'
                      />
                    </div>
                    <h3 className='mb-4 text-xl font-semibold text-black  sm:text-[22px] xl:text-[26px]'>
                      Brian
                    </h3>
                    <p className='text-base text-body pb-5 px-5'>
                      A non-custodial AI assistant for performing transactions by prompting
                    </p>
                    <div className='flex justify-center gap-4'>
                      <a
                        href='#'
                        className='max-w-[250px] flex-1 mb-5 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base text-white font-bold hover:bg-opacity-60'>
                        brian.builder.place
                      </a>
                    </div>
                  </div>
                </div> */}
              <div className='w-full px-4 md:w-1/2 lg:w-1/2'>
                <div className='' data-wow-delay='.3s'>
                  <div className='container overflow-hidden lg:max-w-[1160px]'>
                    <div className='-mx-6 flex flex-wrap'>
                      <div className='w-full px-6'>
                        <div
                          className='wow fadeInUp mb-[15px] rounded-lg bg-white py-9 px-7 shadow-md sm:px-9 lg:px-7 xl:px-9'
                          data-wow-delay='.2s'>
                          <div className='mb-5 border-b border-stroke'>
                            <p className='pb-9 text-base text-body'>
                              "At TalentLayer, in just under two months, we augmented our core team
                              of three developers with 8 new open-source contributors, it completely
                              boosted our production and helped us accomplish far more than
                              expected. It also encouraged us to enhance our development process,
                              making it robust and intuitive for anyone inspired to contribute."
                            </p>
                          </div>

                          <div className='items-center justify-center sm:flex lg:block xl:flex'>
                            <div className='mb-4 flex justify-center items-center sm:mb-0 lg:mb-4 xl:mb-0'>
                              <div className='mr-4 h-[56px] w-full max-w-[56px] rounded-full'>
                                <img
                                  src='/images/romain.png'
                                  alt='author'
                                  className='h-full w-full object-cover object-center'
                                />
                              </div>
                              <div>
                                <h5 className='text-base font-medium text-black '>Romain Martin</h5>
                                <p className='text-sm text-body'>Technical Lead, TalentLayer</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='absolute -top-28 left-0 -z-10 hidden md:block'>
          <svg
            width='632'
            height='1179'
            viewBox='0 0 632 1179'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <g opacity='0.25' filter='url(#filter0_f_38_24)'>
              <circle cx='42.5' cy='589.5' r='329.5' fill='url(#paint0_linear_38_24)' />
            </g>
            <defs>
              <filter
                id='filter0_f_38_24'
                x='-547'
                y='0'
                width='1179'
                height='1179'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'>
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feGaussianBlur stdDeviation='130' result='effect1_foregroundBlur_38_24' />
              </filter>
              <linearGradient
                id='paint0_linear_38_24'
                x1='-366.218'
                y1='919'
                x2='451.176'
                y2='349.901'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#8EA5FE' />
                <stop offset='0.541667' stopColor='#BEB3FD' />
                <stop offset='1' stopColor='#90D1FF' />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className='absolute right-0 top-20 -z-10'>
          <svg
            width='637'
            height='1277'
            viewBox='0 0 637 1277'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <g opacity='0.2' filter='url(#filter0_f_38_23)'>
              <circle cx='638.5' cy='638.5' r='388.5' fill='url(#paint0_linear_38_23)' />
            </g>
            <defs>
              <filter
                id='filter0_f_38_23'
                x='0'
                y='0'
                width='1277'
                height='1277'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'>
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feGaussianBlur stdDeviation='125' result='effect1_foregroundBlur_38_23' />
              </filter>
              <linearGradient
                id='paint0_linear_38_23'
                x1='250'
                y1='250'
                x2='1168.59'
                y2='782.957'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#FF8FE8' />
                <stop offset='1' stopColor='#FFC960' />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      <section id='pricing' className='relative lg:pt-[50px]'>
        <div className='container'>
          <div
            className='wow fadeInUp mx-auto mb-5 max-w-[740px] text-center lg:mb-[30px]'
            data-wow-delay='.2s'>
            <h2 className='mb-4 pt-40 text-3xl font-bold text-black  sm:text-4xl pt-40 md:text-[44px] md:leading-tight'>
              pricing that <span className='text-landingprimary'>works</span> for you
            </h2>
            <p className='text-base text-body'>
              BuilderPlace is designed to help small open-source teams grow. that's why we make sure
              to keep costs low, every step of the way.
            </p>
          </div>
        </div>

        <div className='container max-w-[1390px]'>
          <div className='rounded-2xl bg-white px-5 pt-0 pb-14 md:pb-1 lg:pt-20 lg:pb-5 xl:px-10'>
            <div className='-mx-4 flex flex-wrap justify-center'>
              <div className='w-full px-4 sm:w-1/3'>
                <div
                  className='wow fadeInUp group mx-auto max-w-[510px] text-center pt-4 pb-1 wow fadeInUp mb-[50px] rounded-lg bg-redpraha bg-opacity-60 shadow-lg hover:bg-opacity-20 rounded-3xl'
                  data-wow-delay='.3s'>
                  <h3 className='mb-4 mt-4 font-bold text-[40px]  text-black  xl:mt-10'>hosting</h3>
                  <div className='mx-auto flex mb-4 mt-4  md:mb-8 md:mt-8  items-center justify-center bg-opacity-20 duration-300   '>
                    <h3 className='mb-1 mt-1 md:mb-3 md:mt-3  text-landingprimary font-semibol text-[40px] md:text-[70px]'>
                      free
                    </h3>
                  </div>

                  <p className='text-base text-body pb-10 px-5'>
                    your own BuilderPlace with a custom domain and branding
                  </p>
                </div>
              </div>
              <div className='w-full px-4 sm:w-1/3'>
                <div
                  className='wow fadeInUp group mx-auto max-w-[510px] text-center pt-4 pb-1 wow fadeInUp mb-[50px] rounded-lg bg-redpraha bg-opacity-60 shadow-lg hover:bg-opacity-20 rounded-3xl'
                  data-wow-delay='.3s'>
                  <h3 className='mb-4 mt-4 font-bold text-[40px]  text-black  xl:mt-10'>
                    distribution
                  </h3>
                  <div className='mx-auto flex mb-4 mt-4  md:mb-8 md:mt-8  items-center justify-center bg-opacity-20 duration-300   '>
                    <h3 className='mb-1 mt-1 md:mb-3 md:mt-3  text-landingprimary font-semibol text-[40px] md:text-[70px]'>
                      free
                    </h3>
                  </div>
                  <p className='text-base text-body pb-10 px-5'>
                    posts are automatically shared across a network of platforms
                  </p>
                </div>
              </div>
              <div className='w-full px-4 sm:w-1/3'>
                <div
                  className='wow fadeInUp group mx-auto max-w-[510px] text-center pt-4 pb-1 wow fadeInUp mb-[50px] rounded-lg bg-redpraha bg-opacity-60 shadow-lg hover:bg-opacity-20 rounded-3xl'
                  data-wow-delay='.3s'>
                  <h3 className='mb-4 mt-4 font-bold text-[40px]  text-black  xl:mt-10'>
                    payments
                  </h3>
                  <div className='mx-auto flex mb-4 mt-4  md:mb-8 md:mt-8  items-center justify-center bg-opacity-20 duration-300   '>
                    <h3 className='mb-1 mt-1 md:mb-3 md:mt-3  text-landingprimary font-semibol text-[40px] md:text-[70px]'>
                      2%
                    </h3>
                  </div>

                  <p className='text-base text-body pb-10 px-5'>
                    pay 2% of any payments you release to contributors
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='absolute -top-28 left-0 -z-10 hidden md:block'>
          <svg
            width='632'
            height='1179'
            viewBox='0 0 632 1179'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <g opacity='0.25' filter='url(#filter0_f_38_24)'>
              <circle cx='42.5' cy='589.5' r='329.5' fill='url(#paint0_linear_38_24)' />
            </g>
            <defs>
              <filter
                id='filter0_f_38_24'
                x='-547'
                y='0'
                width='1179'
                height='1179'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'>
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feGaussianBlur stdDeviation='130' result='effect1_foregroundBlur_38_24' />
              </filter>
              <linearGradient
                id='paint0_linear_38_24'
                x1='-366.218'
                y1='919'
                x2='451.176'
                y2='349.901'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#8EA5FE' />
                <stop offset='0.541667' stopColor='#BEB3FD' />
                <stop offset='1' stopColor='#90D1FF' />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className='absolute right-0 top-20 -z-10'>
          <svg
            width='637'
            height='1277'
            viewBox='0 0 637 1277'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <g opacity='0.2' filter='url(#filter0_f_38_23)'>
              <circle cx='638.5' cy='638.5' r='388.5' fill='url(#paint0_linear_38_23)' />
            </g>
            <defs>
              <filter
                id='filter0_f_38_23'
                x='0'
                y='0'
                width='1277'
                height='1277'
                filterUnits='userSpaceOnUse'
                colorInterpolationFilters='sRGB'>
                <feFlood floodOpacity='0' result='BackgroundImageFix' />
                <feBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape' />
                <feGaussianBlur stdDeviation='125' result='effect1_foregroundBlur_38_23' />
              </filter>
              <linearGradient
                id='paint0_linear_38_23'
                x1='250'
                y1='250'
                x2='1168.59'
                y2='782.957'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#FF8FE8' />
                <stop offset='1' stopColor='#FFC960' />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      <section id='about' className='relative pt-[150px]'>
        <div
          className='wow fadeInUp mx-auto mb-14 max-w-[740px] text-center lg:mb-[70px]'
          data-wow-delay='.2s'>
          <h2 className='mb-4 mt-10 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
            create your BuilderPlace{' '}
            <span className='text-landingprimary'>in less than 5 minutes</span>
          </h2>
        </div>
        <div className='container pb-20 lg:max-w-[1120px]'>
          <div>
            <div className='-mx-4 flex flex-wrap items-center justify-between'>
              <div className='w-full px-4 lg:w-1/2'>
                <div
                  className='wow fadeInUp relative z-10 mx-auto mb-14 w-full max-w-[470px] pb-6 lg:mx-0 lg:mb-0'
                  data-wow-delay='.2s'>
                  <img src='/images/iframe.png' alt='about image' className='mx-auto max-w-full' />
                </div>
              </div>

              <div className='w-full px-4 lg:w-1/2'>
                <div className='wow fadeInUp lg:ml-auto lg:max-w-[510px]' data-wow-delay='.3s'>
                  <span className='mb-4 block text-3xl font-medium text-landingprimary md:text-3xl lg:7xl'>
                    step 1
                  </span>
                  <h2 className='mb-4 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
                    configure your BuilderPlace
                  </h2>
                  <p className='mb-[30px] text-base leading-relaxed text-body'>
                    set up your custom domain and branded open-source management center
                  </p>

                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black text-center '>
                      01
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>set up your hirer profile</h5>
                      <p className='text-base text-body'>
                        tell the world a bit about you and why you are building what you are
                        building. mint a soul-bound work ID - the beginning of your on-chian work
                        reputation.
                      </p>
                    </div>
                  </div>

                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black  '>
                      02
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        configure your brand theme
                      </h5>
                      <p className='text-base text-body'>
                        add a custom logo and configure your color pallet.
                      </p>
                    </div>
                  </div>
                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black  '>
                      03
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        access yourbrand.builder.place
                      </h5>
                      <p className='text-base text-body'>
                        get to know your new command center for open-source contribution.
                      </p>
                    </div>
                  </div>
                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black  '>
                      04
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        embed your work board on your website
                      </h5>
                      <p className='text-base text-body'>
                        copy a code snippet and have a live work board on your website in a few
                        seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='container pb-20 lg:max-w-[1120px]'>
          <div>
            <div className='-mx-4 flex flex-wrap items-center justify-between'>
              <div className='w-full px-4 lg:w-1/2'>
                <div
                  className='wow fadeInUp relative z-10 mx-auto mb-10 w-full max-w-[470px] lg:mx-0 lg:mb-0'
                  data-wow-delay='.2s'>
                  <img src='/images/myplace.png' alt='about image' className='mx-auto max-w-full' />
                </div>
              </div>

              <div className='w-full px-4 lg:w-1/2'>
                <div className='wow fadeInUp lg:ml-auto lg:max-w-[510px]' data-wow-delay='.3s'>
                  <span className='mb-4 block text-3xl font-medium text-landingprimary md:text-3xl lg:7xl'>
                    step 2
                  </span>
                  <h2 className='mb-4 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
                    post your missions
                  </h2>

                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black text-center '>
                      01
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        post what you need help with
                      </h5>
                      <p className='text-base text-body'>
                        request work ranging from logo design to software development. open-source
                        contributors love to have impact - they appreciate working on tasks that are
                        core to your project.
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black  '>
                      02
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        get applications from open-source contributors across the ecosystem
                      </h5>
                      <p className='text-base text-body'>
                        contributors will apply to handle a task for you. you white-list one
                        contributor to handle the task - that way there’s no duplicative work, and
                        contributors know what to focus on.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='container pb-20 lg:max-w-[1120px]'>
          <div>
            <div className='-mx-4 flex flex-wrap items-center justify-between'>
              <div className='w-full px-4 lg:w-1/2'>
                <div
                  className='wow fadeInUp relative z-10 mx-auto mb-14 w-full max-w-[470px] pb-6 lg:mx-0 lg:mb-0'
                  data-wow-delay='.2s'>
                  <img src='/images/list.png' alt='about image' className='mx-auto max-w-full' />
                </div>
              </div>

              <div className='w-full px-4 lg:w-1/2'>
                <div className='wow fadeInUp lg:ml-auto lg:max-w-[510px]' data-wow-delay='.3s'>
                  <span className='mb-4 block text-3xl font-medium text-landingprimary md:text-3xl lg:7xl'>
                    step 3
                  </span>
                  <h2 className='mb-4 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
                    manage work and release payments
                  </h2>
                  <p className='mb-[30px] text-base leading-relaxed text-body'>
                    ship faster than ever before and compensate contributors for their help
                  </p>

                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black text-center '>
                      01
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        pay out contributors in USDC, MATIC, or WETH on Polygon
                      </h5>
                      <p className='text-base text-body'>
                        Do you have a token you'd like to see supported?{' '}
                        <a href='#contact' className='underline'>
                          Contact our team
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black  '>
                      02
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        give reviews to help contributors build a reputation
                      </h5>
                      <p className='text-base text-body'>
                        through completing work, contributors grow a strong reputation across
                        open-source ecosystems
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black  '>
                      03
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        manage dispute resolution and make sure everyone’s happy
                      </h5>
                      <p className='text-base text-body'>
                        BuilderPlace platforms use Kleros for decentralized dispute resolution.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='container pb-20 lg:max-w-[1120px]'>
          <div>
            <div className='-mx-4 flex flex-wrap items-center justify-between'>
              <div className='w-full px-4 lg:w-1/2'>
                <div
                  className='wow fadeInUp relative z-10 mx-auto mb-14 w-full max-w-[470px] lg:mx-0 lg:mb-0'
                  data-wow-delay='.2s'>
                  <img src='/images/network.png' alt='about image' className='mx-auto max-w-full' />
                </div>
              </div>

              <div className='w-full px-4 lg:w-1/2'>
                <div className='wow fadeInUp lg:ml-auto lg:max-w-[510px]' data-wow-delay='.3s'>
                  <span className='mb-4 block text-3xl font-medium text-landingprimary md:text-3xl lg:7xl'>
                    step 4
                  </span>
                  <h2 className='mb-4 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
                    grow your contributor community
                  </h2>
                  <p className='mb-[30px] text-base leading-relaxed text-body'>
                    pull in passionate open-source builders from beyond your ecosystem
                  </p>

                  <div className='mb-[30px] flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black text-center '>
                      01
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        get your posts shared across a network of hiring platforms
                      </h5>
                      <p className='text-base text-body'>
                        posts on your BuilderPlace board are searchable by contributors across a
                        network of other hiring platforms - this is made possible by TalentLayer, an
                        interoperability layer for hiring platforms
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center'>
                    <div className='shrink-0 mr-3 flex h-[60px] w-[60px] items-center justify-center rounded-full border border-stroke text-xl font-semibold text-black  '>
                      02
                    </div>
                    <div>
                      <h5 className='text-xl font-medium text-black '>
                        a steady funnel of new open-source contributors for your project
                      </h5>
                      <p className='text-base text-body'>
                        contributors are constantly looking for new projects to help - by posting
                        your work publicly, you help them find you!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='absolute right-0 top-36 -z-10'>
          <svg
            width='95'
            height='190'
            viewBox='0 0 95 190'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle cx='95' cy='95' r='77' stroke='url(#paint0_linear_47_27)' strokeWidth='36' />
            <defs>
              <linearGradient
                id='paint0_linear_47_27'
                x1='0'
                y1='0'
                x2='224.623'
                y2='130.324'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#FF8FE8' />
                <stop offset='1' stopColor='#FFC960' />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      <section id='faq' className='relative z-10 bg-redpraha bg-opacity-50 py-[110px] '>
        <div className='container'>
          <div
            className='wow fadeInUp mx-auto mb-14 max-w-[740px] text-center lg:mb-[70px]'
            data-wow-delay='.2s'>
            <h2 className='mb-4 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
              frequently asked questions
            </h2>
            <p className='text-base text-body'>
              find answers to some common questions about BuilderPlace
            </p>
          </div>

          <div
            className='faqs wow fadeInUp mx-auto w-full max-w-[785px] rounded-lg bg-white px-6 py-[6px] shadow-car'
            data-wow-delay='.3s'>
            <div className='faq border-b border-stroke last-of-type:border-none'>
              <button className='faq-btn relative flex w-full justify-between pt-6 pb-1 px-[18px] text-left text-base font-medium text-black  sm:px-[26px] sm:text-lg'>
                what currencies does the escrow system support?
              </button>
              <div className='pb-4 h-auto overflow-hidden px-[18px] sm:px-[26px]'>
                <p className='text-base text-body'>
                  BuilderPlace's escrow system supports USDC, WETH, and MATIC on the Polygon
                  network. Do you have a token you'd like to see supported?{' '}
                  <a href='#contact' className='underline'>
                    Contact our team
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className='faq border-b border-stroke last-of-type:border-none'>
              <button className='faq-btn relative flex w-full justify-between pt-6 pb-1 px-[18px] text-left text-base font-medium text-black  sm:px-[26px] sm:text-lg'>
                what types of work can I post on my team's BuilderPlace?
              </button>
              <div className='pb-4 h-auto overflow-hidden px-[18px] sm:px-[26px]'>
                <p className='text-base text-body'>
                  teams have had open-source contributors work on everything from building proof of
                  concepts to creating a full-fledged SDK for an infra product. you can make a post
                  for whatever scope of work you prefer. open-source is more than just development -
                  try making posts for design, QA testing, and more.
                </p>
              </div>
            </div>

            <div className='faq border-b border-stroke last-of-type:border-none'>
              <button className='faq-btn relative flex w-full justify-between pt-6 pb-1 px-[18px] text-left text-base font-medium text-black  sm:px-[26px] sm:text-lg'>
                do I need a crypto wallet to interact with my BuilderPlace platform?
              </button>
              <div className='pb-4 h-auto overflow-hidden px-[18px] sm:px-[26px]'>
                <p className='text-base text-body'>
                  For now, you do need to manage your own crypto wallet to post and find work on
                  BuilderPlace.
                </p>
              </div>
            </div>

            <div className='faq border-b border-stroke last-of-type:border-none'>
              <button className='faq-btn relative flex w-full justify-between pt-6 pb-1 px-[18px] text-left text-base font-medium text-black  sm:px-[26px] sm:text-lg'>
                where will my work posts be distributed?
              </button>
              <div className='pb-4 h-auto overflow-hidden px-[18px] sm:px-[26px]'>
                <p className='text-base text-body'>
                  posts are distributed across platforms in the TalentLayer network; this currently
                  includes various freelance marketplaces.{' '}
                  <a className='underline' href='https://talentlayer.org'>
                    Learn more about TalentLayer.
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='absolute right-0 -top-24 -z-10'>
          <svg
            width='95'
            height='190'
            viewBox='0 0 95 190'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle cx='95' cy='95' r='77' stroke='url(#paint0_linear_49_603)' strokeWidth='36' />
            <defs>
              <linearGradient
                id='paint0_linear_49_603'
                x1='0'
                y1='0'
                x2='224.623'
                y2='130.324'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#fe71a1' />
                <stop offset='1' stopColor='#f4dabc' />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className='absolute left-0 -bottom-24 -z-10'>
          <svg
            width='95'
            height='190'
            viewBox='0 0 95 190'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <circle cy='95' r='77' stroke='url(#paint0_linear_52_83)' strokeWidth='36' />
            <defs>
              <linearGradient
                id='paint0_linear_52_83'
                x1='-117.84'
                y1='190'
                x2='117.828'
                y2='25.9199'
                gradientUnits='userSpaceOnUse'>
                <stop stopColor='#f4dabc' />
                <stop stopColor='#f4dabc' />
                <stop offset='1' stopColor='#fe71a1' />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
      <section id='contact' className='relative z-10 pt-[110px]'>
        <div className='container'>
          <div
            className='wow fadeInUp mx-auto mb-14 max-w-[740px] text-center lg:mb-[70px]'
            data-wow-delay='.2s'>
            <img src='/images/stats.png' alt='about image' className='mx-auto max-w-full' />
            <h2 className='mb-4 mt-20 text-3xl font-bold text-black  sm:text-4xl md:text-[44px] md:leading-tight'>
              grow your open-source movement today
            </h2>

            <div className='flex justify-center gap-4'>
              {/* <a
                  href='#'
                  className='max-w-[186px] flex-1 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-medium text-white font-bold hover:bg-opacity-60'>
                  register for <br></br>beta
                </a> */}
              <a
                href='/newonboarding/create-profile'
                className='max-w-[186px] flex-1 rounded-md text-center bg-landingprimary py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-medium text-white font-bold hover:bg-opacity-60'>
                launch my <br></br>BuilderPlace
              </a>
              <a
                target='_blank'
                href='https://twitter.com/TalentLayer'
                className='max-w-[186px] flex-1 text-center rounded-md bg-redpraha py-[6px] px-[12px] xl:py-[10px] xl:px-[30px] text-base font-medium text-stone-800 font-bold hover:bg-opacity-60'>
                contact <br></br>the team
              </a>
            </div>
            <div className='pb-6 pt-10 w-1/2'></div>
          </div>
        </div>
      </section>
      <footer>
        <div className='wow fadeInUp bg-redpraha py-7' data-wow-delay='.2s'>
          <div className='container text-center max-w-[1390px]'>
            <div className='flex justify-center flex-wrap'>
              <div className='order-last w-full text-center px-3 lg:order-first lg:w-1/3'>
                <p className='text-center text-base text-stone-800'>
                  <a href='#' className='hover:opacity-60'>
                    &copy; 2023 BuilderPlace
                  </a>{' '}
                  |{' '}
                  <a href='/terms' className='underline hover:opacity-60'>
                    terms of service
                  </a>
                </p>
              </div>
            </div>
            <a
              href='https://github.com/TalentLayer-Labs/builder-place'
              target='_blank'
              className='text-landingprimary underline hover:opacity-60'>
              100% opens-source
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
