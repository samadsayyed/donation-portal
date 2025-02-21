import api from './axios';

export const fetchCountries = async ({queryKey}) => {  
    const [, country_id] = queryKey;
    
    const {data} = await api.get(`/country/${country_id}`)
    return data;
  };