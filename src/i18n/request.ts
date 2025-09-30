import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'es'];

export default getRequestConfig(async ({ locale }) => {
  const validatedLocale = locales.includes(locale!) ? locale! : 'en';
  
  return {
    locale: validatedLocale,
    messages: (await import(`../../messages/${validatedLocale}.json`)).default
  };
});
