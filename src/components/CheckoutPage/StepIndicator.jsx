import React from "react";
import { ChevronRight } from "lucide-react";

const steps = [
  { number: 1, title: "Donation Cart" },
  { number: 2, title: "Gift Aid" },
  { number: 3, title: "Personal Info" },
];

const StepIndicator = ({ step }) => (
  <div className="flex justify-center items-center gap-4 mb-8">
    {steps.map((s) => (
      <div key={s.number} className="flex items-center">
        <div
          className={`flex items-center justify-center rounded-full w-8 h-8 ${
            step === s.number ? "bg-black text-white" : "bg-gray-100 text-gray-400"
          } transition-colors duration-200`}
        >
          {s.number}
        </div>
        <span className="ml-2 text-sm font-medium text-gray-900">{s.title}</span>
        {s.number < steps.length && <ChevronRight className="ml-2 text-gray-400" size={16} />}
      </div>
    ))}
  </div>
);

export default StepIndicator;
