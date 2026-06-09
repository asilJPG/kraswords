import { Suspense } from 'react'
import LoginForm from '@/components/login/LoginForm'

export default function LoginPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}
