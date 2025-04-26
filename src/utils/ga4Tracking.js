import ReactGA from 'react-ga4';

// Initialize GA4 with your measurement ID
export const initGA = () => {
  ReactGA.initialize('G-ZX6XWYTMCP'); // Replace with your actual GA4 measurement ID
};

// Track page views
export const trackPageView = path => {
  ReactGA.send({ hitType: 'pageview', page: path });
};
