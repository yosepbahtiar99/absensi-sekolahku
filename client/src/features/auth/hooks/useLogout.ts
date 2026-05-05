import { useAuthStore } from '../../../shared/store/authStore';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

export const useLogout = () => {
  const logoutStore = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API failed', error);
    } finally {
      logoutStore();
      navigate('/login');
    }
  };

  return { logout };
};
