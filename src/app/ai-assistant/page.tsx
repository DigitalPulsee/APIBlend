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
  X
} from 'lucide-react'

type Language = 'javascript' | 'python' | 'html' | 'css' | 'react' | 'node' | 'sql' | 'mongodb' | 'git' | 'algorithms'

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
  { icon: Code, title: 'Generador de Código', description: 'Genera código automáticamente basado en tu descripción' },
  { icon: Bug, title: 'Debugger Inteligente', description: 'Encuentra y corrige errores en tu código' },
  { icon: GraduationCap, title: 'Ruta de Aprendizaje', description: 'Sigue una guía paso a paso para aprender programación' },
  { icon: Search, title: 'Revisión de Código', description: 'Analiza y mejora la calidad de tu código' },
  { icon: Plug, title: 'Integración de APIs', description: 'Aprende a conectar APIs en tus proyectos' },
  { icon: Star, title: 'Mejores Prácticas', description: 'Guía de mejores prácticas de programación' },
]

const SAMPLE_EXERCISES: Record<Language, Exercise> = {
  javascript: {
    title: 'Suma de Array',
    description: 'Crea una función que sume todos los números de un array.',
    language: 'JavaScript',
    starterCode: `function sumarArray(numeros) {
  // Tu código aquí
}

// Prueba tu función
console.log(sumarArray([1, 2, 3, 4, 5])); // Debería mostrar 15`,
    solution: `function sumarArray(numeros) {
  return numeros.reduce((acc, num) => acc + num, 0);
}

console.log(sumarArray([1, 2, 3, 4, 5])); // 15`
  },
  python: {
    title: 'Palíndromo',
    description: 'Crea una función que determine si una palabra es un palíndromo.',
    language: 'Python',
    starterCode: `def es_palindromo(palabra):
    # Tu código aquí
    pass

# Prueba tu función
print(es_palindromo("radar"))  # True
print(es_palindromo("python")) # False`,
    solution: `def es_palindromo(palabra):
    palabra = palabra.lower()
    return palabra == palabra[::-1]

print(es_palindromo("radar"))  # True
print(es_palindromo("python")) # False`
  },
  html: {
    title: 'Estructura HTML',
    description: 'Crea una estructura HTML básica con header, main y footer.',
    language: 'HTML',
    starterCode: `<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Agrega el título y meta tags -->
</head>
<body>
    <!-- Crea header, main y footer -->
</body>
</html>`,
    solution: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Página</title>
</head>
<body>
    <header>
        <h1>Bienvenido</h1>
        <nav>
            <a href="#">Inicio</a>
            <a href="#">Acerca</a>
        </nav>
    </header>
    <main>
        <p>Contenido principal</p>
    </main>
    <footer>
        <p>&copy; 2025</p>
    </footer>
</body>
</html>`
  },
  css: {
    title: 'Flexbox Layout',
    description: 'Crea un layout con Flexbox que centre elementos.',
    language: 'CSS',
    starterCode: `.container {
  /* Usa flexbox para centrar */
}

.item {
  /* Estiliza los items */
}`,
    solution: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  min-height: 100vh;
}

.item {
  padding: 20px 40px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
}`
  },
  react: {
    title: 'Contador con useState',
    description: 'Crea un componente contador usando el hook useState.',
    language: 'React',
    starterCode: `import { useState } from 'react';

function Contador() {
  // Implementa el estado y las funciones
  
  return (
    <div>
      {/* Muestra el contador y botones */}
    </div>
  );
}`,
    solution: `import { useState } from 'react';

function Contador() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h2>Contador: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}`
  },
  node: {
    title: 'Servidor HTTP',
    description: 'Crea un servidor HTTP básico con Node.js.',
    language: 'Node.js',
    starterCode: `const http = require('http');

// Crea el servidor
const server = http.createServer((req, res) => {
  // Responde con "Hola Mundo"
});

// Inicia el servidor en el puerto 3000`,
    solution: `const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hola Mundo');
});

server.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});`
  },
  sql: {
    title: 'Consulta SELECT',
    description: 'Escribe una consulta que obtenga usuarios mayores de 18 años.',
    language: 'SQL',
    starterCode: `-- Tabla: usuarios (id, nombre, edad, email)
-- Obtén nombre y email de usuarios mayores de 18 años
-- Ordena por edad descendente`,
    solution: `SELECT nombre, email
FROM usuarios
WHERE edad > 18
ORDER BY edad DESC;`
  },
  mongodb: {
    title: 'Consulta Find',
    description: 'Escribe una consulta MongoDB para buscar documentos.',
    language: 'MongoDB',
    starterCode: `// Colección: productos
// Busca productos con precio mayor a 100
// y categoría "electrónica"`,
    solution: `db.productos.find({
  precio: { $gt: 100 },
  categoria: "electrónica"
}).sort({ precio: -1 });`
  },
  git: {
    title: 'Flujo Git',
    description: 'Escribe los comandos para crear una rama y hacer merge.',
    language: 'Git',
    starterCode: `# 1. Crear una nueva rama llamada "feature"
# 2. Cambiar a esa rama
# 3. Hacer commit de cambios
# 4. Volver a main y hacer merge`,
    solution: `# 1. Crear rama
git branch feature

# 2. Cambiar a la rama
git checkout feature
# o: git switch feature

# 3. Hacer commit
git add .
git commit -m "Nueva funcionalidad"

# 4. Merge
git checkout main
git merge feature`
  },
  algorithms: {
    title: 'Búsqueda Binaria',
    description: 'Implementa el algoritmo de búsqueda binaria.',
    language: 'JavaScript',
    starterCode: `function busquedaBinaria(arr, target) {
  // Implementa búsqueda binaria
  // Retorna el índice o -1 si no se encuentra
}

// Prueba
const arr = [1, 3, 5, 7, 9, 11, 13];
console.log(busquedaBinaria(arr, 7)); // 3`,
    solution: `function busquedaBinaria(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 13];
console.log(busquedaBinaria(arr, 7)); // 3`
  }
}

function generateAIResponse(message: string, language: Language): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('api rest') || lowerMessage.includes('rest api')) {
    return `## ¿Qué es una API REST?

Una **API REST** (Representational State Transfer) es un estilo arquitectónico para diseñar servicios web. Características principales:

### Principios REST:
1. **Sin estado**: Cada petición contiene toda la información necesaria
2. **Cliente-Servidor**: Separación de responsabilidades
3. **Cacheable**: Las respuestas pueden ser cacheadas
4. **Interfaz uniforme**: Uso de métodos HTTP estándar

### Métodos HTTP:
\`\`\`
GET    - Obtener recursos
POST   - Crear recursos
PUT    - Actualizar recursos
DELETE - Eliminar recursos
\`\`\`

### Ejemplo en JavaScript:
\`\`\`javascript
// GET request
fetch('https://api.ejemplo.com/usuarios')
  .then(res => res.json())
  .then(data => console.log(data));

// POST request
fetch('https://api.ejemplo.com/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre: 'Juan' })
});
\`\`\`

¿Te gustaría que profundice en algún aspecto específico?`
  }
  
  if (lowerMessage.includes('fetch')) {
    return `## Uso de fetch() en JavaScript

\`fetch()\` es la API moderna para hacer peticiones HTTP en JavaScript.

### Ejemplo básico GET:
\`\`\`javascript
async function obtenerDatos() {
  try {
    const response = await fetch('https://api.ejemplo.com/datos');
    
    if (!response.ok) {
      throw new Error('Error en la petición');
    }
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

### Ejemplo POST:
\`\`\`javascript
async function enviarDatos(datos) {
  const response = await fetch('https://api.ejemplo.com/datos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos)
  });
  
  return response.json();
}

// Uso
enviarDatos({ nombre: 'Juan', edad: 25 });
\`\`\`

¿Necesitas más ejemplos o tienes alguna duda?`
  }
  
  if (lowerMessage.includes('react')) {
    return `## ¿Qué es React?

**React** es una biblioteca de JavaScript para construir interfaces de usuario, desarrollada por Facebook.

### Características principales:
- **Componentes**: Bloques reutilizables de UI
- **Virtual DOM**: Actualizaciones eficientes
- **JSX**: Sintaxis que combina JavaScript y HTML
- **Hooks**: Funciones para manejar estado y ciclo de vida

### Ejemplo de componente:
\`\`\`jsx
import { useState } from 'react';

function Contador() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Has hecho clic {count} veces</p>
      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>
    </div>
  );
}

export default Contador;
\`\`\`

### Hooks más usados:
- \`useState\`: Manejo de estado local
- \`useEffect\`: Efectos secundarios
- \`useContext\`: Acceso a contexto global
- \`useRef\`: Referencias a elementos DOM

¿Quieres que te explique algún concepto específico de React?`
  }
  
  if (lowerMessage.includes('python') && lowerMessage.includes('función')) {
    return `## Funciones en Python

Las funciones en Python se definen con la palabra clave \`def\`.

### Sintaxis básica:
\`\`\`python
def saludar(nombre):
    """Función que saluda a una persona"""
    return f"¡Hola, {nombre}!"

# Llamar la función
mensaje = saludar("María")
print(mensaje)  # ¡Hola, María!
\`\`\`

### Con parámetros por defecto:
\`\`\`python
def potencia(base, exponente=2):
    return base ** exponente

print(potencia(3))     # 9
print(potencia(3, 3))  # 27
\`\`\`

### Función con *args y **kwargs:
\`\`\`python
def sumar(*numeros):
    return sum(numeros)

print(sumar(1, 2, 3, 4, 5))  # 15

def mostrar_info(**datos):
    for clave, valor in datos.items():
        print(f"{clave}: {valor}")

mostrar_info(nombre="Ana", edad=25)
\`\`\`

¿Te gustaría ver más ejemplos?`
  }
  
  const responses: Record<Language, string> = {
    javascript: `¡Claro! Te ayudo con JavaScript.

${message}

Para responder mejor, ¿podrías darme más contexto sobre:
- ¿Qué estás tratando de lograr?
- ¿Hay algún error específico?
- ¿Es para frontend o backend (Node.js)?`,
    python: `¡Por supuesto! Te ayudo con Python.

${message}

Para darte la mejor respuesta, dime:
- ¿Qué versión de Python usas?
- ¿Es para un proyecto específico?
- ¿Necesitas ver un ejemplo de código?`,
    html: `¡Claro! Te ayudo con HTML.

${message}

Para asistirte mejor:
- ¿Qué tipo de elemento necesitas crear?
- ¿Es para un formulario, layout, o contenido?`,
    css: `¡Por supuesto! Te ayudo con CSS.

${message}

¿Podrías especificar:
- ¿Qué efecto visual buscas?
- ¿Usas algún framework como Tailwind?`,
    react: `¡Claro! Te ayudo con React.

${message}

Para responder mejor:
- ¿Es un componente funcional o de clase?
- ¿Qué hooks estás usando?`,
    node: `¡Por supuesto! Te ayudo con Node.js.

${message}

Especifica:
- ¿Usas Express u otro framework?
- ¿Es para una API o aplicación web?`,
    sql: `¡Claro! Te ayudo con SQL.

${message}

¿Qué base de datos usas?
- MySQL, PostgreSQL, SQLite, etc.`,
    mongodb: `¡Por supuesto! Te ayudo con MongoDB.

${message}

¿Usas Mongoose o el driver nativo?`,
    git: `¡Claro! Te ayudo con Git.

${message}

¿Qué operación necesitas realizar?`,
    algorithms: `¡Por supuesto! Te ayudo con algoritmos.

${message}

¿Qué tipo de problema estás resolviendo?`
  }
  
  return responses[language] || responses.javascript
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
  const [codeOutput, setCodeOutput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

    setTimeout(() => {
      const response = generateAIResponse(content, selectedLanguage)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  const resetChat = () => {
    setMessages([])
    setInput('')
  }

  const openExercise = () => {
    const exercise = SAMPLE_EXERCISES[selectedLanguage]
    setCurrentExercise(exercise)
    setUserCode(exercise.starterCode)
    setShowSolution(false)
    setCodeOutput('')
    setShowExercise(true)
  }

  const runCode = () => {
    setCodeOutput('✅ Código ejecutado correctamente.\n\nPara ver resultados reales, copia el código a tu editor o consola.')
  }

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        if (match) {
          const code = match[2]
          return (
            <pre key={index} className="bg-zinc-900 rounded-lg p-4 my-3 overflow-x-auto">
              <code className="text-sm text-green-400 font-mono">{code}</code>
            </pre>
          )
        }
      }
      
      return (
        <div key={index} className="whitespace-pre-wrap">
          {part.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('## ', '')}</h2>
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="text-md font-semibold mt-3 mb-1">{line.replace('### ', '')}</h3>
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4">{line.replace('- ', '')}</li>
            }
            if (line.match(/^\d+\./)) {
              return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\.\s*/, '')}</li>
            }
            return <p key={i}>{line}</p>
          })}
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-500" />
              <span className="text-xl font-bold">APIBlend AI</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a APIBlend
                </Button>
              </Link>
              <Button onClick={resetChat} size="sm" className="bg-purple-600 hover:bg-purple-700">
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
            <Card className="p-4 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Lenguajes</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-zinc-400 uppercase mb-2">Principales</h4>
                  <div className="space-y-1">
                    {LANGUAGES.slice(0, 4).map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedLanguage === lang.id 
                            ? 'bg-purple-600/30 text-purple-300' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className={`${lang.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                          {lang.icon}
                        </span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-zinc-400 uppercase mb-2">Frameworks</h4>
                  <div className="space-y-1">
                    {LANGUAGES.slice(4, 6).map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedLanguage === lang.id 
                            ? 'bg-purple-600/30 text-purple-300' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className={`${lang.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                          {lang.icon}
                        </span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs text-zinc-400 uppercase mb-2">Bases de Datos</h4>
                  <div className="space-y-1">
                    {LANGUAGES.slice(6, 8).map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguage(lang.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedLanguage === lang.id 
                            ? 'bg-purple-600/30 text-purple-300' 
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <span className={`${lang.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                          {lang.icon}
                        </span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <History className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold">Historial</h3>
              </div>
              <div className="text-sm text-zinc-400">
                {messages.length > 0 
                  ? `${messages.length} mensajes en esta sesión`
                  : 'Sin conversaciones aún'}
              </div>
            </Card>
          </aside>

          <Card className="flex flex-col bg-white/5 border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Asistente de IA para Programación</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-zinc-400">En línea</span>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="space-y-8">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">¡Hola! Soy tu asistente de IA para programación</h3>
                    <p className="text-zinc-400">Puedo ayudarte con:</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['Generar código', 'Corregir errores', 'Explicar conceptos', 'Resolver dudas'].map(tag => (
                        <span key={tag} className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">
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
                          className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-left transition-colors"
                        >
                          <Icon className="w-5 h-5 text-purple-400 mb-2" />
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
                      className={`flex items-start gap-3 ${
                        message.role === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[80%] rounded-xl p-4 ${
                        message.role === 'user' 
                          ? 'bg-blue-600/30 text-white' 
                          : 'bg-white/10 text-zinc-100'
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
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t border-white/10">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta o pide que genere código... (Enter para enviar)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-zinc-500"
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
                  className="border-white/10 text-white hover:bg-white/10"
                  onClick={() => setInput(input + '\n```\n\n```')}
                >
                  <Code className="w-4 h-4 mr-1" />
                  Insertar código
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 text-white hover:bg-white/10"
                  onClick={openExercise}
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Ejercicio práctico
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-white/10 text-white hover:bg-white/10"
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
                  className="p-4 bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => sendMessage(`Quiero usar la herramienta: ${tool.title}`)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-sm">{tool.title}</h4>
                  </div>
                  <p className="text-xs text-zinc-400">{tool.description}</p>
                </Card>
              )
            })}
          </aside>
        </div>
      </main>

      {showExercise && currentExercise && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-zinc-900 border-white/10">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{currentExercise.title}</h2>
                <p className="text-zinc-400 text-sm">{currentExercise.language}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowExercise(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Descripción</h3>
                <p className="text-zinc-300">{currentExercise.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Tu código</h3>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={runCode} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-1" />
                      Ejecutar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setShowSolution(!showSolution)}
                      className="border-white/20"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      {showSolution ? 'Ocultar' : 'Ver'} Solución
                    </Button>
                  </div>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  className="w-full h-48 bg-zinc-800 border border-white/10 rounded-lg p-4 font-mono text-sm text-green-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {codeOutput && (
                <div>
                  <h3 className="font-semibold mb-2">Resultado</h3>
                  <pre className="bg-zinc-800 border border-white/10 rounded-lg p-4 text-sm text-zinc-300">
                    {codeOutput}
                  </pre>
                </div>
              )}

              {showSolution && (
                <div>
                  <h3 className="font-semibold mb-2">Solución</h3>
                  <pre className="bg-zinc-800 border border-green-500/30 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
                    {currentExercise.solution}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowExercise(false)} className="border-white/20">
                Cerrar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Enviar Solución
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="fixed bottom-6 left-6 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 border border-white/10">
        <Zap className="w-3 h-3 text-purple-400" />
        <span>powered by <strong>TEAM ABQ</strong></span>
      </div>
    </div>
  )
}
