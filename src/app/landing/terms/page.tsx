import Link from 'next/link';
import Header from '../../../components/Landing/Header';

export default function TermsPage() {
  return (
    <div className='bg-white text-black'>
      <Header />

      <main>
        <section id='features' className='relative lg:pt-[110px]'>
          <div className='container'>
            <div
              className='wow fadeInUp mx-auto mb-14 max-w-[690px] lg:mb-[70px]'
              data-wow-delay='.2s'>
              <h2 className='mb-4 text-3xl font-bold text-black text-center  sm:text-4xl pt-40 md:text-[44px] leading-tight'>
                terms of service
              </h2>
              <div className='pt-20 text-justify'></div>
              <p className='pb-5'>
                Forty Four Labs OU and/or its&rsquo; affiliates (&ldquo;BuilderPlace&rdquo;) is
                granting access to the SAAS product (&ldquo;The Product&rdquo;) to you as the
                individual, company, or legal entity (&ldquo;The Customer&rdquo;) on the condition
                that you accept all of the terms of this (&ldquo;Terms of Service&rdquo;,
                &ldquo;TOS&rdquo;) as defined below. This TOS constitutes a legal and enforceable
                contract between The Customer and BuilderPlace. By using BuilderPlace and related
                services you implicitly agree to this Terms of Service. If The Customer does not
                agree to this Terms of Service, they should make no further use of The Product.
              </p>

              <p className='pb-2 font-bold text-landingprimary'>Ownership</p>
              <p className='pb-5'>
                The Customer acknowledges that BuilderPlace is an open-source product and use of The
                Product does not convey any rights to intellectual property
              </p>

              <p className='pb-2 font-bold text-landingprimary'>Data Privacy</p>
              <p className='pb-5'>
                By engaging with The Product, The Customer consents to BuilderPlace storing account
                information on their behalf. BuilderPlace is compliant with GDPR regulatory
                requirements. If you intend to initiate a Right of Access Request please contact our
                team at the following email info@builder.place.
              </p>

              <p className='pb-2 font-bold text-landingprimary'>Taxes</p>
              <p className='pb-5'>
                The Customer commits to maintaining the proper tax filings relating to payments to
                or from The Customer relating to labor agreements (&ldquo;Work&rdquo;) conducted
                through The Product. BuilderPlace will be not be held liable for improper tax
                filings of The Customer or it&rsquo;s affiliates.
              </p>

              <p className='pb-2 font-bold text-landingprimary'>Payments</p>
              <p className='pb-5'>
                A 2% fee will be levied on payments handled through the BuilderPlace escrow system
                (Escrow). Fees are automatically withdrawn from final amounts released from Escrow.
              </p>

              <p className='pb-2 font-bold text-landingprimary'>Term</p>
              <p className='pb-5'>
                This Terms of Service will be effective upon The Customer&rsquo;s first access of
                The Product and shall remain in force during the applicable throughout The
                Customer&rsquo;s continued use of The Product, as applicable
              </p>

              <p className='pb-2 font-bold text-landingprimary'>Governing Law and Jurisdiction</p>
              <p className='pb-5'>
                The governing jurisdiction for this contract is Estonia. Each Party agrees to the
                applicable governing law below without regard to choice or conflicts of law rules,
                and to the exclusive jurisdiction of the applicable courts below with respect to any
                dispute, claim, action, suit or proceeding (including non-contractual disputes or
                claims) arising out of or in connection with this Terms of Service, or its subject
                matter or formation. To the extent not prohibited by applicable law, each of the
                Parties hereby irrevocably waives any and all right to trial by jury in any legal
                proceeding arising out of or related to this Terms of Service.
              </p>
              <p className='pb-2 font-bold text-landingprimary'>Waiver</p>
              <p className='pb-5'>
                Waiver The Customer agrees that neither they, nor any person, organization, or any
                other entity acting on his behalf will file, charge, claim, sue BuilderPlace or
                permit to be filed, charged or claimed, any action for damages or other relief
                (including injunctive, declaratory, monetary relief or other) against BuilderPlace,
                involving any matter occurring in the past up to the date of this Terms of Service
                or involving any continuing effects of actions or practices which arose prior to the
                date of this Terms of Service, or involving and based upon any claims, demands,
                causes of action, obligations, damages or liabilities which are the subject of these
                Terms of Service.
              </p>
            </div>
          </div>
        </section>
      </main>

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
                  <Link href='/terms' className='underline hover:opacity-60'>
                    terms of service
                  </Link>
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
    </div>
  );
}
