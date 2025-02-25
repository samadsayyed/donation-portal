import api from "./axios";

export const fetchPrograms = async ({ queryKey }) => {
  const [, category_id] = queryKey;

  const { data } = await api.get(`/program/${category_id}`);
  return data;
};

export const fetchProgramRate = async (selectedCategory, selectedCountry, selectedProgram) => {
  if (!selectedProgram) return null;
  const response = await api.get(`/program-rate/${selectedProgram}/${selectedCountry}`);
  return response.data; // ✅ Return entire object, including program_rate
};

