import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import ErrorBoundary from '../components/ErrorBoundary';

const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default PublicOnlyRoute;
