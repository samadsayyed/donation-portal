export const userFields = [
  { name: "title", label: "Title" },
  { name: "firstName", label: "First Name" },
  { name: "lastName", label: "Last Name" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
];

export const addressFields = [
  { name: "country", label: "Country" }, // Moved to the top
  { name: "postcode", label: "Postcode" }, // Added postcode for PAF
  { name: "address1", label: "Address 1" },
  { name: "address2", label: "Address 2" },
  { name: "city", label: "City" },
];


export const titleOptions = ["Mr", "Mrs", "Miss", "Dr", "Prof"];

export const requiredFields = [
  "title",
  "firstName",
  "lastName",
  "email",
  "phone",
  "country",
  "postcode",
  "address1",
  "city",
  "address2"
];