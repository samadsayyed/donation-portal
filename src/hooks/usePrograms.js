import { useState, useEffect } from 'react';
import { programApi } from '../api/programsApi';

const usePrograms = (category) => {
    const [programs, setPrograms] = useState([]);
    console.log(programs || [],"category");
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                const response = await programApi.getPrograms(category);
                if (isMounted) {
                    setPrograms(response.data.program);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Failed to fetch programs');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (category) {
            fetchPrograms(); // Only fetch if category is provided
        }

        return () => {
            isMounted = false;
        };
    }, [category]);

    return { programs, loading, error };
};

export default usePrograms;
