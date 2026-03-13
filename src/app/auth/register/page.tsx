import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'
import { DollarSign } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50">
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div className="bg-emerald-600 p-4 rounded-3xl shadow-lg shadow-emerald-600/30 mb-5">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">FX Control</h1>
        <p className="text-slate-500 text-sm mt-1">Control de compra de divisas</p>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl shadow-xl px-6 pt-8 pb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Crear cuenta</h2>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-emerald-600 font-semibold">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
