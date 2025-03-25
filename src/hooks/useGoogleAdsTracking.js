import { useEffect } from "react";

const useGoogleAdsTracking = () => {
  useEffect(() => {
    // Check if script is already added
    if (!window.gtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=AW-10986743129";
      document.head.appendChild(script);

      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag("js", new Date());
        gtag("config", "AW-10986743129");
      };
    }
  }, []);
};

export default useGoogleAdsTracking;
