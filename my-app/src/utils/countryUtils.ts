import countries from 'world-countries';

export function getCountryIsoCode(countryName: string): string {
  const country = countries.find(
    c => c.name.common.toLowerCase() === countryName.toLowerCase() ||
         c.name.official.toLowerCase() === countryName.toLowerCase()
  );
  
  return country?.cca2 || "UN"; // cca2 is the 2-letter ISO code
}

export function getCountryName(isoCode: string): string {
  const country = countries.find(c => c.cca2 === isoCode.toUpperCase());
  return country?.name.common || isoCode;
}