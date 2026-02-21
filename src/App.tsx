import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { InvitationPage } from '@/pages/InvitationPage'
import AdminPage from '@/pages/AdminPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvitationPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
