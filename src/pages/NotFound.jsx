import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
            <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Oops! The page you're looking for seems to have wandered off into the digital wilderness.
            </p>
            <Link
                to="/"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-300"
            >
                Return Home
            </Link>
        </div>
    </div>
);

export default NotFound; 