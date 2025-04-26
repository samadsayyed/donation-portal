import api from "./axios";

export const fetchCountries = async (program) => {
  try {
    const response = await api.get(`/country/${program}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
};

export const fetchCountriesList = async () => {
  const { data } = await api.get(`/country`);
  return data.data;
};
