import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt } from 'react-icons/fa';

const Logout = () => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      // Optional: Call backend logout endpoint
      console.log('[Logout] Logging out user:', user?.email);
    } catch (err) {
      console.error('Logout error:', err);
    }
    
    // Use AuthContext logout to ensure state consistency
    logout();
    
    // Redirect to login
    window.location.href = '/login';
  }

  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <button onClick={handleLogout} 
      className='flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'>
        <FaSignOutAlt className= 'mr-2' />
        Logout
      </button>
      <p className='mt-4 text-gray-600'>
        You are already singed in. Click above to logout
      </p>
    </div>
  )
}

export default Logout