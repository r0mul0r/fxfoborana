import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { DollarSign } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50">
      {/* Top brand */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="bg-emerald-600 p-4 rounded-3xl shadow-lg shadow-emerald-600/30 mb-5">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">FX Control</h1>
        <p className="text-slate-500 text-sm mt-1">Control de compra de divisas</p>
      </div>

      {/* Form card */}
      <div className="flex-1 bg-white rounded-t-3xl shadow-xl px-6 pt-8 pb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Iniciar sesión</h2>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/register" className="text-emerald-600 font-semibold">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
