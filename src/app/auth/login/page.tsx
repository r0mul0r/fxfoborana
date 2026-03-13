import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { DollarSign } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-500 p-3 rounded-2xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">FX Control</h1>
          <p className="mt-2 text-slate-400">Control de compra de divisas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Iniciar sesión</h2>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-emerald-600 font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
