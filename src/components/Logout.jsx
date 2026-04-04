import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FaSignOutAlt } from 'react-icons/fa'

const Logout = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event('authStateChanged'));
    toast.success('Logged out successfully');
  }
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <button onClick={handleLogout}
        className='flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'>
        <FaSignOutAlt className='mr-2' />
        Logout
      </button>
      <p className='mt-4 text-gray-600'>
        You are already signed in. Click above to logout
      </p>
    </div>
  )
}

export default Logout