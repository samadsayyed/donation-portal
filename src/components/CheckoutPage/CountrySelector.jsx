import React from "react";
// import '../../../../index.css'
const CountrySelector = ({ countries, onChange, selectedCountry }) => (
    <div className="w-full">
      <label
        htmlFor="countries"
        className="block text-gray-700 font-bold mb-2"
      >
        Select a Country
      </label>
      <select
        id="countries"
        value={selectedCountry}
        onChange={onChange}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
      >
        <option value="" disabled>
          {countries.length === 0 ? "Loading..." : "Select a country"}
        </option>
        {countries.map((country) => (
          <option key={country.country_id} value={country.country_id}>
            {country.country_name}
          </option>
        ))}
      </select>
    </div>
  );
  export default CountrySelector;