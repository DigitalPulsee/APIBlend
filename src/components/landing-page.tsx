"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Rocket, 
  Code, 
  Zap, 
  Bot, 
  Shield, 
  TrendingUp, 
  Cloud,
  Menu,
  X,
  ChevronUp,
  Building2,
  Star,
  CheckCircle2,
  Lock,
  Mail,
  User,
  AlertCircle
} from 'lucide-react'

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, text: 'Ingresa una contraseña' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
      
      const header = document.querySelector('header')
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }

      const elements = document.querySelectorAll('.animate-on-scroll')
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight - 100
        if (isVisible) {
          element.classList.add('is-visible')
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  const calculatePasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: 'Ingresa una contraseña' }
    
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 15
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20
    if (/\d/.test(password)) strength += 20
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20

    let text = 'Débil'
    if (strength > 60) text = 'Fuerte'
    else if (strength > 30) text = 'Medio'

    return { strength, text }
  }

  const validateForm = (formData: FormData) => {
    const errors: Record<string, string> = {}
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!name || name.length < 3) {
      errors.name = 'Por favor, ingresa tu nombre completo'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Por favor, ingresa un email válido'
    }

    if (!password || password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})

    const formData = new FormData(e.currentTarget)
    const errors = validateForm(formData)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setIsSubmitting(false)
      return
    }

    setTimeout(() => {
      showNotification('¡Cuenta creada exitosamente! Revisa tu email.', 'success')
      setIsSubmitting(false)
      ;(e.target as HTMLFormElement).reset()
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {notification && (
        <div className={`fixed top-24 right-5 z-[1001] px-6 py-4 rounded-xl text-white font-medium shadow-lg animate-in slide-in-from-right-full ${
          notification.type === 'success' ? 'bg-gradient-to-r from-green-600 to-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
              <Code className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-white">APIBlend</span>
            </div>

            <button
              className="lg:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <ul className="hidden lg:flex items-center gap-8 text-sm text-white/80">
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
                  Características
                </button>
              </li>
              <li>
                <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                  Soluciones
                </button>
              </li>
              <li>
                <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                  Precios
                </button>
              </li>
              <li>
                <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                  Recursos
                </button>
              </li>
            </ul>

            <Button onClick={() => scrollToSection('registration')} className="hidden lg:flex bg-blue-600 hover:bg-blue-700">
              Probar gratis
            </Button>
          </nav>

          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/10 animate-in slide-in-from-top-2">
              <ul className="space-y-4 text-white/80">
                <li>
                  <button onClick={() => { scrollToSection('features'); setIsMenuOpen(false) }} className="block">
                    Características
                  </button>
                </li>
                <li>
                  <button onClick={() => { showNotification('Próximamente', 'success'); setIsMenuOpen(false) }} className="block">
                    Soluciones
                  </button>
                </li>
                <li>
                  <button onClick={() => { showNotification('Próximamente', 'success'); setIsMenuOpen(false) }} className="block">
                    Precios
                  </button>
                </li>
                <li>
                  <button onClick={() => { showNotification('Próximamente', 'success'); setIsMenuOpen(false) }} className="block">
                    Recursos
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-zinc-800">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Rocket className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Nueva versión 3.0 disponible ahora</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                Revoluciona tu forma de integrar APIs
              </h1>

              <p className="text-xl text-white/80 leading-relaxed">
                La plataforma visual más avanzada para conectar aplicaciones y automatizar flujos de trabajo sin escribir código.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => scrollToSection('registration')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <User className="w-5 h-5 mr-2" />
                  Crear cuenta
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => showNotification('Demo próximamente', 'success')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Ver demo
                </Button>
              </div>
            </div>

            <Card className="p-6 bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-white/10 rounded-lg animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <div className="h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg border border-white/10 flex items-center justify-center">
                  <Code className="w-16 h-16 text-blue-400 animate-pulse" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Potencia tus integraciones</h2>
            <p className="text-xl text-zinc-600">
              Descubre cómo APIBlend puede transformar la forma en que conectas tus aplicaciones y servicios favoritos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: 'Interfaz visual intuitiva',
                description: 'Arrastra y suelta bloques para crear integraciones complejas sin escribir una sola línea de código.'
              },
              {
                icon: Zap,
                title: 'Automatización avanzada',
                description: 'Automatiza tareas entre diferentes aplicaciones y servicios con triggers y acciones configurables.'
              },
              {
                icon: Bot,
                title: 'Integración con IA',
                description: 'Incorpora inteligencia artificial a tus flujos de trabajo con conectores preconstruidos para APIs de IA.'
              },
              {
                icon: Shield,
                title: 'Seguridad empresarial',
                description: 'Protección de datos de nivel empresarial con cifrado end-to-end y cumplimiento de GDPR.'
              },
              {
                icon: TrendingUp,
                title: 'Analytics en tiempo real',
                description: 'Monitorea el rendimiento de tus integraciones con dashboards y métricas detalladas.'
              },
              {
                icon: Cloud,
                title: 'Escalabilidad en la nube',
                description: 'Infraestructura cloud que escala automáticamente según las necesidades de tu negocio.'
              }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index}
                  className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-t-4 border-t-blue-600 animate-on-scroll"
                  onClick={() => showNotification('Más información próximamente', 'success')}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section id="registration" className="py-24 bg-gradient-to-br from-zinc-50 to-white">
        <div className="container mx-auto px-6">
          <Card className="max-w-2xl mx-auto p-8 lg:p-12 shadow-2xl animate-on-scroll">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Comienza ahora</h2>
              <p className="text-zinc-600">Regístrate para obtener una prueba gratuita de 14 días</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre completo *
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Tu nombre completo"
                  className={formErrors.name ? 'border-red-500' : ''}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo electrónico *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  className={formErrors.email ? 'border-red-500' : ''}
                  required
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Empresa
                </Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Nombre de tu empresa (opcional)"
                />
              </div>

              <div>
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Contraseña *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Crea una contraseña segura"
                  className={formErrors.password ? 'border-red-500' : ''}
                  onChange={(e) => setPasswordStrength(calculatePasswordStrength(e.target.value))}
                  required
                />
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.password}
                  </p>
                )}
                {passwordStrength.strength > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength > 60 ? 'bg-green-500' : 
                          passwordStrength.strength > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">{passwordStrength.text}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmar contraseña *
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                  required
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando cuenta...
                  </div>
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Crear cuenta
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-600 mt-6">
              Al registrarte, aceptas nuestros{' '}
              <button onClick={() => showNotification('Próximamente', 'success')} className="text-blue-600 hover:underline">
                Términos de servicio
              </button>{' '}
              y{' '}
              <button onClick={() => showNotification('Próximamente', 'success')} className="text-blue-600 hover:underline">
                Política de privacidad
              </button>.
            </p>
          </Card>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">Revoluciona tu flujo de trabajo</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de empresas que están transformando sus procesos con APIBlend
          </p>
          <Button 
            size="lg" 
            onClick={() => scrollToSection('registration')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Star className="w-5 h-5 mr-2" />
            Comenzar ahora
          </Button>
        </div>
      </section>

      <footer className="bg-zinc-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold">APIBlend</span>
              </div>
              <p className="text-zinc-400 mb-6">
                La plataforma visual para integrar APIs y automatizar flujos de trabajo sin código.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
                    Características
                  </button>
                </li>
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Soluciones
                  </button>
                </li>
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Precios
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Documentación
                  </button>
                </li>
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Blog
                  </button>
                </li>
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Comunidad
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Nosotros
                  </button>
                </li>
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Contacto
                  </button>
                </li>
                <li>
                  <button onClick={() => showNotification('Próximamente', 'success')} className="hover:text-white transition-colors">
                    Soporte
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 text-center text-zinc-400">
            <p>&copy; 2025 APIBlend. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
      )}

      <div className="fixed bottom-6 left-6 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 border border-white/10">
        <Zap className="w-3 h-3 text-blue-400" />
        <span>powered by <strong>DigitalPulse</strong></span>
      </div>
    </div>
  )
}
