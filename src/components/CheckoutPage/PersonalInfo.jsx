import React, { useState, useEffect } from "react";
import { CreditCard, Banknote } from "lucide-react";
import { FindAddressPopup } from "./FindAddressPopup";
import { userFields, addressFields, titleOptions } from "../../utils/data";
import { useAuth } from "../../context/AuthContext";
import { getDonorInfo, getDonorAddress } from "../../api/donationApi";
import { useQuery } from "@tanstack/react-query";

const PersonalInfo = ({ donation, setDonation, countries, paymentGateway, setPaymentGateway, submitted }) => {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Get user email and donor ID from localStorage if not available in auth context
  const userEmail = user?.user_email || JSON.parse(localStorage.getItem('user'))?.user_email;
  const donorId = user?.user_id || JSON.parse(localStorage.getItem('user'))?.user_id;

  // Fetch donor info if user is authenticated
  const { data: donorInfo } = useQuery({
    queryKey: ['donorInfo', userEmail],
    queryFn: () => getDonorInfo(userEmail),
    enabled: !!userEmail,
  });

  console.log(donorInfo, "--------");


  // Fetch donor address if user is authenticated
  const { data: addressData } = useQuery({
    queryKey: ['donorAddress', donorId],
    queryFn: () => getDonorAddress(donorId),
    enabled: !!donorId
  });




  // Initialize form with user data if authenticated
  useEffect(() => {
    if (donorInfo?.data && !submitted) {
      setDonation((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          title: donorInfo.data.title || "Mr",
          firstName: donorInfo.data.first_name || "",
          lastName: donorInfo.data.last_name || "",
          email: donorInfo.data.email || "",
          phone: donorInfo.data.mobile || "",
        }
      }));
    }
  }, [donorInfo, setDonation, submitted]);

  // Initialize address if authenticated
  useEffect(() => {
    if (addressData?.data && !submitted) {
      setDonation((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          address1: addressData.data.address1 || "",
          address2: addressData.data.address2 || "",
          city: addressData.data.city_name || "",
          postcode: addressData.data.post_code || "",
          country: addressData.data.country_id?.toString() || "",
          address_id: addressData.data.address_id || null,
        }
      }));
    }
  }, [addressData, setDonation, submitted]);

  useEffect(() => {
    if (!donation.paymentMethod) {
      setDonation((prev) => ({ ...prev, paymentMethod: "stripe" }));
    }
    if (!donation.personalInfo.country && countries.length > 0) {
      setDonation((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          country: countries[0].country_id.toString(),
          title: "Mr"
        }
      }));
    }
  }, [donation.paymentMethod, countries, setDonation]);

  const validateField = (name, value) => {
    if (!value || value.trim() === "") {
      return "This field is required";
    }

    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address";
        }
        break;
      case "phone":
        const phoneRegex = /^[\d\s+()-]{10,}$/;
        if (!phoneRegex.test(value)) {
          return "Please enter a valid phone number";
        }
        break;
      case "postcode":
        if (donation.personalInfo.country === "1") { // UK
          const ukPostcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
          if (!ukPostcodeRegex.test(value)) {
            return "Please enter a valid UK postcode";
          }
        }
        break;
    }
    return "";
  };

  const handleChange = (e) => {
    if (submitted) return;

    const { name, value } = e.target;
    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value },
    }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    if (submitted) return;

    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSelectAddress = (address) => {
    if (submitted) return;

    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, address1: address },
    }));
    setShowPopup(false);

    // Validate address field
    const error = validateField("address1", address);
    setErrors(prev => ({
      ...prev,
      address1: error
    }));
    setTouched(prev => ({
      ...prev,
      address1: true
    }));
  };

  const handleSelectPaymentGateway = (gateway) => {
    if (submitted) return;

    setPaymentGateway(gateway);
    setDonation((prev) => ({ ...prev, paymentMethod: gateway }));
  };

  const getFieldError = (name) => {
    return touched[name] && errors[name];
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-black">Personal Details</h2>

      {/* User Information Fields */}
      <div className="grid grid-cols-1 gap-4">
        {/* Name Fields - Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4">
          {/* Title Dropdown */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <select
              name="title"
              value={donation.personalInfo.title || "Mr"}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 appearance-none cursor-pointer ${getFieldError("title")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Select Title</option>
              {titleOptions.map((title) => (
                <option key={title} value={title}>{title}</option>
              ))}
            </select>
            {getFieldError("title") && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* First Name */}
          <div className="col-span-1 md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={donation.personalInfo.firstName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("firstName")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your first name"
            />
            {getFieldError("firstName") && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="col-span-1 md:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={donation.personalInfo.lastName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("lastName")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your last name"
            />
            {getFieldError("lastName") && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Fields - Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={donation.personalInfo.email || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted || !!userEmail}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("email")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${(submitted || !!userEmail) ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your email"
            />
            {getFieldError("email") && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
            {!!userEmail && (
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed for logged-in users</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="text"
              name="phone"
              value={donation.personalInfo.phone || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("phone")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your phone"
            />
            {getFieldError("phone") && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Address Section */}
      <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Address Details</h2>

      {/* Country & Postcode in the same row */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4">
        {/* Country Selection */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
          <select
            name="country"
            value={donation.personalInfo.country || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={submitted}
            className={`w-full rounded-lg border h-10 px-3 appearance-none cursor-pointer ${getFieldError("country")
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-200 focus:ring-black focus:border-black"
              } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
          >
            <option value="">Select Country</option>
            {countries.map(({ country_id, country_name }) => (
              <option key={country_id} value={country_id}>{country_name}</option>
            ))}
          </select>
          {getFieldError("country") && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        {/* Postcode Input & Find Address Button */}
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Code / ZIP *</label>
            <input
              type="text"
              name="postcode"
              value={donation.personalInfo.postcode || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={submitted}
              className={`w-full rounded-lg border h-10 px-3 ${getFieldError("postcode")
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:ring-black focus:border-black"
                } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="Enter your postal code"
            />
            {getFieldError("postcode") && (
              <p className="mt-1 text-sm text-red-600">{errors.postcode}</p>
            )}
          </div>

          {/* Find Address Button - Only visible if Country ID is 1 and not submitted */}
          {donation.personalInfo.country === "1" && !submitted && (
            <button
              type="button"
              className="h-10 mt-6 bg-black text-white px-4 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center justify-center min-w-[120px]"
              onClick={() => setShowPopup(true)}
            >
              Find Address
            </button>
          )}

          {/* Disabled Find Address Button - Visible if Country ID is 1 and submitted */}
          {donation.personalInfo.country === "1" && submitted && (
            <button
              type="button"
              className="h-10 mt-6 bg-gray-400 text-white px-4 rounded-lg cursor-not-allowed whitespace-nowrap flex items-center justify-center min-w-[120px]"
              disabled
            >
              Find Address
            </button>
          )}
        </div>
      </div>

      {/* Other Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {addressFields.map(({ name, label }) => (
          name !== "country" && name !== "postcode" && (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
              <input
                type="text"
                name={name}
                value={donation.personalInfo[name] || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitted}
                className={`w-full rounded-lg border h-10 px-3 ${getFieldError(name)
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-200 focus:ring-black focus:border-black"
                  } ${submitted ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
              {getFieldError(name) && (
                <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
              )}
            </div>
          )
        ))}
      </div>

      {/* Payment Gateway Selection */}
      {/* Payment Gateway Selection */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Gateway</label>
        <div className="flex flex-wrap gap-4">
          {["stripe", "paypal"].map((gateway) => (
            <div
              key={gateway}
              onClick={() => !submitted && handleSelectPaymentGateway(gateway)}
              className={`border rounded-lg p-4 flex items-center gap-3 ${!submitted ? "cursor-pointer hover:bg-gray-50" : "cursor-not-allowed"
                } transition-all ${donation.paymentMethod === gateway
                  ? "border-black ring-1 ring-black bg-gray-50"
                  : "border-gray-200"
                } ${submitted ? "opacity-75" : ""}`}
            >
              <img src={gateway === "stripe" ? "/stripe.png" : "/paypal.png"} className="h-6 w-6" alt="" />
              <span className="font-medium capitalize">{gateway}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Find Address Popup Component */}
      <FindAddressPopup
        show={showPopup && !submitted}
        setDonation={setDonation}
        postcode={donation.personalInfo.postcode}
        onSelect={handleSelectAddress}
        donation={donation}
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
};

export default PersonalInfo;