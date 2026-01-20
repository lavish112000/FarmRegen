import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ErrorBoundary from '../components/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ProtectedRoute;
