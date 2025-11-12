import { useCountries } from './useCountry';
import { useBlocs } from './useBlocs';

export interface TradePartyOption {
  value: string;
  label: string;
  type: 'COUNTRY' | 'BLOC';
  description?: string;
}

export function useTradeParties() {
  const { data: countries, isLoading: countriesLoading, error: countriesError } = useCountries();
  const { data: blocs, isLoading: blocsLoading, error: blocsError } = useBlocs();

  const options: TradePartyOption[] = [];

  // Add blocs
  if (blocs && Array.isArray(blocs)) {
    blocs.forEach(bloc => {
      const memberCount = bloc.memberCountries?.length || 0;
      options.push({
        value: bloc.code,
        label: `${bloc.name} (${bloc.code})`,
        type: 'BLOC',
        description: `Bloc - ${bloc.name} (${memberCount} members)`
      });
    });
  }

  // Add countries
  if (countries && Array.isArray(countries)) {
    countries.forEach(country => {
      options.push({
        value: country.code,
        label: country.name,
        type: 'COUNTRY',
        description: `Country - ${country.name}`
      });
    });
  }

  return {
    data: options,
    isLoading: countriesLoading || blocsLoading,
    error: countriesError || blocsError,
    countries,
    blocs
  };
}