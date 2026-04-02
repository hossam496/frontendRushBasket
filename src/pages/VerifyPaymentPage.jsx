import React, { useEffect, useState } from 'react'
import { useCart } from '../CartContext'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

const VerifyPaymentPage = () => {
  const [statusMsg, setStatusMsg] = useState("Verifing Payment...")
  const { clearCart } = useCart()
  const navigate = useNavigate()
  const { search } = useLocation()
  useEffect(() => {
    const params = new URLSearchParams(search)
    const session_id = params.get("session_id")
    const payment_status = params.get("payment_status")
    api.get('/api/orders/confirm', {
      params: { session_id }
    })
      .then(() => {
        clearCart()
        navigate("/myorders", { replace: true })
      })
      .catch((err) => {
        console.error("Confirmation error", err);
        setStatusMsg('There was an error confirming your payment')
      })
  }, [search, clearCart, navigate])
  return (
    <div className='min-h-screen flex items-center justify-center text-white'>
      <p>{statusMsg}</p>
    </div>
  )
}

export default VerifyPaymentPage