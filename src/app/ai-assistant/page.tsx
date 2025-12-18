"use client"

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bot, 
  Code, 
  Send, 
  ArrowLeft, 
  RefreshCw, 
  Trash2,
  User,
  Zap,
  Brain,
  Bug,
  GraduationCap,
  Search,
  Star,
  Plug,
  History,
  Play,
  Lightbulb,
  X,
  Sun,
  Moon
} from 'lucide-react'

type Language = 'javascript' | 'python' | 'html' | 'css' | 'react' | 'node' | 'sql' | 'mongodb'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Exercise {
  title: string
  description: string
  language: string
  starterCode: string
  solution: string
}

const LANGUAGES: { id: Language; name: string; icon: string; color: string }[] = [
  { id: 'javascript', name: 'JavaScript', icon: 'JS', color: 'bg-yellow-500' },
  { id: 'python', name: 'Python', icon: 'PY', color: 'bg-blue-500' },
  { id: 'html', name: 'HTML', icon: 'H', color: 'bg-orange-500' },
  { id: 'css', name: 'CSS', icon: 'C', color: 'bg-blue-400' },
  { id: 'react', name: 'React', icon: 'R', color: 'bg-cyan-500' },
  { id: 'node', name: 'Node.js', icon: 'N', color: 'bg-green-600' },
  { id: 'sql', name: 'SQL', icon: 'SQL', color: 'bg-purple-500' },
  { id: 'mongodb', name: 'MongoDB', icon: 'M', color: 'bg-green-500' },
]

const QUICK_PROMPTS = [
  { icon: Code, text: '¿Cómo funciona una API REST?', prompt: 'Explica cómo funciona una API REST' },
  { icon: Zap, text: 'Ejemplo de fetch() en JavaScript', prompt: 'Muéstrame un ejemplo de fetch() en JavaScript' },
  { icon: Brain, text: '¿Qué es React?', prompt: '¿Qué es React y para qué sirve?' },
  { icon: Code, text: 'Función en Python', prompt: 'Cómo crear una función en Python' },
]

const TOOLS = [
  { icon: Code, title: 'Generador de Código', description: 'Genera código automáticamente' },
  { icon: Bug, title: 'Debugger', description: 'Encuentra errores en tu código' },
  { icon: GraduationCap, title: 'Aprendizaje', description: 'Guías paso a paso' },
  { icon: Search, title: 'Revisión', description: 'Mejora tu código' },
  { icon: Plug, title: 'APIs', description: 'Conecta servicios' },
  { icon: Star, title: 'Best Practices', description: 'Mejores prácticas' },
]

const SAMPLE_EXERCISES: Record<Language, Exercise> = {
  javascript: {
    title: 'Suma de Array',
    description: 'Crea una función que sume todos los números de un array.',
    language: 'JavaScript',
    starterCode: `function sumarArray(numeros) {\n  // Tu código aquí\n}\n\nconsole.log(sumarArray([1, 2, 3, 4, 5]));`,
    solution: `function sumarArray(numeros) {\n  return numeros.reduce((acc, num) => acc + num, 0);\n}\n\nconsole.log(sumarArray([1, 2, 3, 4, 5])); // 15`
  },
  python: {
    title: 'Palíndromo',
    description: 'Crea una función que determine si una palabra es un palíndromo.',
    language: 'Python',
    starterCode: `def es_palindromo(palabra):\n    # Tu código aquí\n    pass\n\nprint(es_palindromo("radar"))`,
    solution: `def es_palindromo(palabra):\n    palabra = palabra.lower()\n    return palabra == palabra[::-1]\n\nprint(es_palindromo("radar"))  # True`
  },
  html: {
    title: 'Estructura HTML',
    description: 'Crea una estructura HTML básica.',
    language: 'HTML',
    starterCode: `<!DOCTYPE html>\n<html>\n<head>\n    <!-- Agrega título -->\n</head>\n<body>\n    <!-- Crea header y main -->\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="es">\n<head>\n    <title>Mi Página</title>\n</head>\n<body>\n    <header><h1>Bienvenido</h1></header>\n    <main><p>Contenido</p></main>\n</body>\n</html>`
  },
  css: {
    title: 'Flexbox Layout',
    description: 'Crea un layout con Flexbox.',
    language: 'CSS',
    starterCode: `.container {\n  /* Usa flexbox */\n}`,
    solution: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 20px;\n}`
  },
  react: {
    title: 'Contador useState',
    description: 'Crea un contador con useState.',
    language: 'React',
    starterCode: `import { useState } from 'react';\n\nfunction Contador() {\n  // Tu código\n}`,
    solution: `import { useState } from 'react';\n\nfunction Contador() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}`
  },
  node: {
    title: 'Servidor HTTP',
    description: 'Crea un servidor básico.',
    language: 'Node.js',
    starterCode: `const http = require('http');\n\n// Crea el servidor`,
    solution: `const http = require('http');\n\nhttp.createServer((req, res) => {\n  res.end('Hola Mundo');\n}).listen(3000);`
  },
  sql: {
    title: 'SELECT Query',
    description: 'Escribe una consulta SELECT.',
    language: 'SQL',
    starterCode: `-- Obtén usuarios mayores de 18`,
    solution: `SELECT * FROM usuarios WHERE edad > 18 ORDER BY edad DESC;`
  },
  mongodb: {
    title: 'Find Query',
    description: 'Escribe una consulta find.',
    language: 'MongoDB',
    starterCode: `// Busca productos con precio > 100`,
    solution: `db.productos.find({ precio: { $gt: 100 } }).sort({ precio: -1 });`
  }
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript')
  const [showExercise, setShowExercise] = useState(false)
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [userCode, setUserCode] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) setTheme(savedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const sendMessage = async (content: string = input) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          language: selectedLanguage
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.error || 'Error al procesar la solicitud',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error de conexión. Por favor, intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => setMessages([])

  const openExercise = () => {
    const exercise = SAMPLE_EXERCISES[selectedLanguage]
    setCurrentExercise(exercise)
    setUserCode(exercise.starterCode)
    setShowSolution(false)
    setShowExercise(true)
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        if (match) {
          return (
            <pre key={index} className={`rounded-lg p-4 my-3 overflow-x-auto ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
              <code className="text-sm text-green-500 font-mono">{match[2]}</code>
            </pre>
          )
        }
      }
      
      return (
        <div key={index} className="whitespace-pre-wrap">
          {part.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>
            if (line.startsWith('### ')) return <h3 key={i} className="text-md font-semibold mt-3 mb-1">{line.replace('### ', '')}</h3>
            if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>
            if (line.match(/^\d+\./)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i}>{line.replace(/\*\*/g, '')}</strong>
            return <p key={i}>{line}</p>
          })}
        </div>
      )
    })
  }

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white' : 'bg-gradient-to-br from-zinc-100 via-white to-zinc-50 text-zinc-900'}`}>
      <header className={`fixed top-0 w-full z-50 backdrop-blur-md border-b ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-zinc-200'}`}>
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-500" />
              <span className="text-xl font-bold">APIBlend AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={toggleTheme} className={isDark ? 'text-white hover:bg-white/10' : 'hover:bg-zinc-100'}>
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" className={isDark ? 'border-white/20 text-white hover:bg-white/10' : ''}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <Button onClick={clearChat} size="sm" className="bg-purple-600 hover:bg-purple-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Nuevo Chat
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="pt-20 pb-6 container mx-auto px-6">
        <div className="grid lg:grid-cols-[280px_1fr_280px] gap-6 h-[calc(100vh-120px)]">
          <aside className="hidden lg:block space-y-6">
            <Card className={`p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Lenguajes</h3>
              </div>
              
              <div className="space-y-1">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      selectedLanguage === lang.id 
                        ? 'bg-purple-600/30 text-purple-300' 
                        : isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                    }`}
                  >
                    <span className={`${lang.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                      {lang.icon}
                    </span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </Card>

            <Card className={`p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">Historial</h3>
              </div>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {messages.length > 0 ? `${messages.length} mensajes` : 'Sin conversaciones'}
              </p>
            </Card>
          </aside>

          <Card className={`flex flex-col overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200'}`}>
            <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <div>
                <h2 className="font-semibold">Asistente IA para Programación</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Conectado con Gemini AI</span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="space-y-8">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">¡Hola! Soy tu asistente de programación</h3>
                    <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>Powered by Google Gemini AI</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['Generar código', 'Corregir errores', 'Explicar conceptos', 'Resolver dudas'].map(tag => (
                        <span key={tag} className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {QUICK_PROMPTS.map((prompt, i) => {
                      const Icon = prompt.icon
                      return (
                        <button
                          key={i}
                          onClick={() => sendMessage(prompt.prompt)}
                          className={`p-4 rounded-xl border text-left transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'}`}
                        >
                          <Icon className="w-5 h-5 text-purple-500 mb-2" />
                          <p className="text-sm">{prompt.text}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`max-w-[80%] rounded-xl p-4 ${
                        message.role === 'user' 
                          ? 'bg-blue-600/30 text-white' 
                          : isDark ? 'bg-white/10' : 'bg-zinc-100'
                      }`}>
                        {message.role === 'assistant' 
                          ? renderMessageContent(message.content)
                          : <p>{message.content}</p>
                        }
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className={`rounded-xl p-4 ${isDark ? 'bg-white/10' : 'bg-zinc-100'}`}>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta... (Enter para enviar)"
                  className={`w-full rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-zinc-500' : 'bg-zinc-50 border border-zinc-200 placeholder-zinc-400'}`}
                  rows={3}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="absolute bottom-3 right-3 bg-purple-600 hover:bg-purple-700 rounded-lg p-2 h-auto"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={isDark ? 'border-white/10 text-white hover:bg-white/10' : ''}
                  onClick={openExercise}
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Ejercicio
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={isDark ? 'border-white/10 text-white hover:bg-white/10' : ''}
                  onClick={clearChat}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              </div>
            </div>
          </Card>

          <aside className="hidden lg:block space-y-4">
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon
              return (
                <Card 
                  key={i}
                  className={`p-4 cursor-pointer transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                  onClick={() => sendMessage(`Quiero usar: ${tool.title}`)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm">{tool.title}</h4>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{tool.description}</p>
                </Card>
              )
            })}
          </aside>
        </div>
      </main>

      {showExercise && currentExercise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className={`w-full max-w-4xl max-h-[90vh] overflow-auto ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white'}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <div>
                <h2 className="text-xl font-bold">{currentExercise.title}</h2>
                <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>{currentExercise.language}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowExercise(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>{currentExercise.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Tu código</h3>
                  <Button size="sm" variant="outline" onClick={() => setShowSolution(!showSolution)} className={isDark ? 'border-white/20' : ''}>
                    <Lightbulb className="w-4 h-4 mr-1" />
                    {showSolution ? 'Ocultar' : 'Ver'} Solución
                  </Button>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className={`w-full h-48 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-zinc-800 border border-white/10 text-green-400' : 'bg-zinc-50 border border-zinc-200'}`}
                />
              </div>

              {showSolution && (
                <div>
                  <h3 className="font-semibold mb-2">Solución</h3>
                  <pre className={`rounded-lg p-4 text-sm font-mono overflow-x-auto ${isDark ? 'bg-zinc-800 border border-green-500/30 text-green-400' : 'bg-zinc-50 border border-zinc-200'}`}>
                    {currentExercise.solution}
                  </pre>
                </div>
              )}
            </div>

            <div className={`p-6 border-t flex justify-end gap-3 ${isDark ? 'border-white/10' : 'border-zinc-200'}`}>
              <Button variant="outline" onClick={() => setShowExercise(false)} className={isDark ? 'border-white/20' : ''}>
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className={`fixed bottom-6 left-6 px-4 py-2 rounded-full text-xs flex items-center gap-2 border ${isDark ? 'bg-black/80 text-white border-white/10' : 'bg-white/80 text-zinc-900 border-zinc-200'}`}>
        <Zap className="w-3 h-3 text-purple-500" />
        <span>powered by <strong>TEAM ABQ</strong></span>
      </div>
    </div>
  )
}
