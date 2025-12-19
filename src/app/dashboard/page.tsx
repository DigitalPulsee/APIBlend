'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Handle,
  Position
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Code,
  LogOut,
  Plus,
  Save,
  Play,
  Trash2,
  Sun,
  Moon,
  Zap,
  Bot,
  Mail,
  MessageSquare,
  Table,
  Webhook,
  Globe,
  Filter,
  ArrowRightLeft,
  Settings,
  ChevronRight,
  Check,
  X,
  Menu,
  Home,
  Workflow,
  User,
  Send
} from 'lucide-react'

interface APINode {
  id: string
  type: string
  name: string
  icon: any
  color: string
  config: any
}

const API_NODES: APINode[] = [
  { id: 'webhook', type: 'webhook', name: 'Webhook', icon: Webhook, color: 'bg-purple-600', config: { url: '', method: 'POST' } },
  { id: 'http', type: 'http', name: 'HTTP Request', icon: Globe, color: 'bg-blue-600', config: { url: '', method: 'GET', headers: {} } },
  { id: 'email', type: 'email', name: 'Email', icon: Mail, color: 'bg-red-500', config: { to: '', subject: '', body: '' } },
  { id: 'slack', type: 'slack', name: 'Slack', icon: MessageSquare, color: 'bg-green-600', config: { webhookUrl: '', channel: '', message: '' } },
  { id: 'sheets', type: 'sheets', name: 'Google Sheets', icon: Table, color: 'bg-emerald-600', config: { spreadsheetId: '', range: '', operation: 'read' } },
  { id: 'transform', type: 'transform', name: 'Transformar', icon: ArrowRightLeft, color: 'bg-orange-500', config: { transformations: [] } },
  { id: 'filter', type: 'filter', name: 'Filtrar', icon: Filter, color: 'bg-yellow-500', config: { conditions: [], logic: 'AND' } },
]

function CustomNode({ data, selected }: { data: any; selected: boolean }) {
  const Icon = data.icon
  return (
    <div className={`px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all ${
      selected ? 'border-blue-500 shadow-lg shadow-blue-500/30' : 'border-transparent'
    } ${data.isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-md'}`}>
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3" />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${data.color} rounded-lg flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">{data.label}</p>
          <p className={`text-xs ${data.isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{data.type}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-green-500 !w-3 !h-3" />
    </div>
  )
}

const nodeTypes = { custom: CustomNode }

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'editor' | 'chat'>('editor')
  const [workflowName, setWorkflowName] = useState('Mi Workflow')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [nodeConfig, setNodeConfig] = useState<any>({})
  const [testResult, setTestResult] = useState<any>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const onConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  const addNode = (apiNode: APINode) => {
    const newNode: Node = {
      id: `${apiNode.type}_${Date.now()}`,
      type: 'custom',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: apiNode.name,
        type: apiNode.type,
        icon: apiNode.icon,
        color: apiNode.color,
        config: { ...apiNode.config },
        isDark: theme === 'dark'
      }
    }
    setNodes((nds) => [...nds, newNode])
    showNotification(`Nodo ${apiNode.name} agregado`, 'success')
  }

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node)
    setNodeConfig(node.data.config || {})
  }

  const updateNodeConfig = (key: string, value: any) => {
    setNodeConfig((prev: any) => ({ ...prev, [key]: value }))
    
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNode.id
            ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
            : n
        )
      )
    }
  }

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id))
      setSelectedNode(null)
      showNotification('Nodo eliminado', 'success')
    }
  }

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      showNotification('Agrega nodos al workflow primero', 'error')
      return
    }

    setIsExecuting(true)
    setTestResult(null)

    try {
      const results: any[] = []
      
      for (const node of nodes) {
        const response = await fetch('/api/execute-api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiType: node.data.type,
            config: node.data.config,
            testData: results.length > 0 ? results[results.length - 1].data : {}
          })
        })

        const result = await response.json()
        results.push({ node: node.data.label, ...result })
      }

      setTestResult(results)
      showNotification('Workflow ejecutado correctamente', 'success')
    } catch (error: any) {
      showNotification(error.message || 'Error al ejecutar', 'error')
    } finally {
      setIsExecuting(false)
    }
  }

  const saveWorkflow = async () => {
    if (!user) return

    try {
      const workflowData = {
        user_id: user.id,
        name: workflowName,
        config: { nodes, edges },
        is_active: true,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('workflows')
        .upsert(workflowData)

      if (error) throw error
      showNotification('Workflow guardado', 'success')
    } catch (error: any) {
      showNotification(error.message || 'Error al guardar', 'error')
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setChatInput('')
    setIsChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, language: 'JavaScript' })
      })

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setChatMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (error: any) {
      setChatMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.' 
      }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return null

  const isDark = theme === 'dark'

  const renderConfigPanel = () => {
    if (!selectedNode) return null

    const type = selectedNode.data.type

    return (
      <div className="space-y-4">
        {type === 'webhook' && (
          <>
            <div>
              <Label className={isDark ? 'text-white' : ''}>URL del Webhook</Label>
              <Input
                value={nodeConfig.url || ''}
                onChange={(e) => updateNodeConfig('url', e.target.value)}
                placeholder="https://ejemplo.com/webhook"
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Método</Label>
              <select
                value={nodeConfig.method || 'POST'}
                onChange={(e) => updateNodeConfig('method', e.target.value)}
                className={`w-full p-2 rounded-md border ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </>
        )}

        {type === 'http' && (
          <>
            <div>
              <Label className={isDark ? 'text-white' : ''}>URL</Label>
              <Input
                value={nodeConfig.url || ''}
                onChange={(e) => updateNodeConfig('url', e.target.value)}
                placeholder="https://api.ejemplo.com/endpoint"
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Método HTTP</Label>
              <select
                value={nodeConfig.method || 'GET'}
                onChange={(e) => updateNodeConfig('method', e.target.value)}
                className={`w-full p-2 rounded-md border ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </>
        )}

        {type === 'email' && (
          <>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Para (Email)</Label>
              <Input
                value={nodeConfig.to || ''}
                onChange={(e) => updateNodeConfig('to', e.target.value)}
                placeholder="destinatario@email.com"
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Asunto</Label>
              <Input
                value={nodeConfig.subject || ''}
                onChange={(e) => updateNodeConfig('subject', e.target.value)}
                placeholder="Asunto del email"
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Mensaje</Label>
              <textarea
                value={nodeConfig.body || ''}
                onChange={(e) => updateNodeConfig('body', e.target.value)}
                placeholder="Contenido del email..."
                rows={3}
                className={`w-full p-2 rounded-md border resize-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`}
              />
            </div>
          </>
        )}

        {type === 'slack' && (
          <>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Webhook URL de Slack</Label>
              <Input
                value={nodeConfig.webhookUrl || ''}
                onChange={(e) => updateNodeConfig('webhookUrl', e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Canal</Label>
              <Input
                value={nodeConfig.channel || ''}
                onChange={(e) => updateNodeConfig('channel', e.target.value)}
                placeholder="#general"
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Mensaje</Label>
              <textarea
                value={nodeConfig.message || ''}
                onChange={(e) => updateNodeConfig('message', e.target.value)}
                placeholder="Mensaje a enviar..."
                rows={3}
                className={`w-full p-2 rounded-md border resize-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`}
              />
            </div>
          </>
        )}

        {type === 'sheets' && (
          <>
            <div>
              <Label className={isDark ? 'text-white' : ''}>ID de la Hoja</Label>
              <Input
                value={nodeConfig.spreadsheetId || ''}
                onChange={(e) => updateNodeConfig('spreadsheetId', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Rango</Label>
              <Input
                value={nodeConfig.range || ''}
                onChange={(e) => updateNodeConfig('range', e.target.value)}
                placeholder="Sheet1!A1:D10"
                className={isDark ? 'bg-zinc-800 border-zinc-700 text-white' : ''}
              />
            </div>
            <div>
              <Label className={isDark ? 'text-white' : ''}>Operación</Label>
              <select
                value={nodeConfig.operation || 'read'}
                onChange={(e) => updateNodeConfig('operation', e.target.value)}
                className={`w-full p-2 rounded-md border ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`}
              >
                <option value="read">Leer datos</option>
                <option value="write">Escribir datos</option>
                <option value="append">Agregar fila</option>
              </select>
            </div>
          </>
        )}

        <Button
          variant="destructive"
          className="w-full mt-4"
          onClick={deleteSelectedNode}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Eliminar nodo
        </Button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white font-medium shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {notification.message}
        </div>
      )}

      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'} border-r flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-inherit">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-500" />
              <span className="font-bold">APIBlend</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={isDark ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          <Link href="/">
            <Button variant="ghost" className={`w-full justify-start ${isDark ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}`}>
              <Home className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">Inicio</span>}
            </Button>
          </Link>
          <Button
            variant={activeTab === 'editor' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'editor' ? 'bg-blue-600 hover:bg-blue-700' : isDark ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}`}
            onClick={() => setActiveTab('editor')}
          >
            <Workflow className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Editor</span>}
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'default' : 'ghost'}
            className={`w-full justify-start ${activeTab === 'chat' ? 'bg-purple-600 hover:bg-purple-700' : isDark ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}`}
            onClick={() => setActiveTab('chat')}
          >
            <Bot className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Chat IA</span>}
          </Button>
        </nav>

        <div className="p-2 border-t border-inherit">
          <Button
            variant="ghost"
            className={`w-full justify-start ${isDark ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}`}
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {sidebarOpen && <span className="ml-3">{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-500 hover:text-red-600 ${isDark ? 'hover:bg-zinc-700' : 'hover:bg-zinc-100'}`}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="ml-3">Cerrar sesión</span>}
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={`h-16 flex items-center justify-between px-6 border-b ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center gap-4">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className={`w-64 ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : ''}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={saveWorkflow} className={isDark ? 'border-zinc-600' : ''}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
            <Button onClick={executeWorkflow} disabled={isExecuting} className="bg-green-600 hover:bg-green-700">
              {isExecuting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Ejecutar
            </Button>
          </div>
        </header>

        {activeTab === 'editor' ? (
          <div className="flex-1 flex">
            <div className={`w-64 p-4 border-r overflow-auto ${isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                APIs Disponibles
              </h3>
              <div className="space-y-2">
                {API_NODES.map((node) => {
                  const Icon = node.icon
                  return (
                    <button
                      key={node.id}
                      onClick={() => addNode(node)}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                        isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-zinc-100 shadow-sm'
                      }`}
                    >
                      <div className={`w-8 h-8 ${node.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{node.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 relative">
              <ReactFlow
                nodes={nodes.map(n => ({ ...n, data: { ...n.data, isDark } }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                className={isDark ? 'bg-zinc-900' : 'bg-zinc-100'}
              >
                <Controls className={isDark ? '[&>button]:bg-zinc-800 [&>button]:border-zinc-700' : ''} />
                <MiniMap className={isDark ? 'bg-zinc-800' : ''} />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={isDark ? '#3f3f46' : '#d4d4d8'} />
              </ReactFlow>

              {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Workflow className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                    <p className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>
                      Selecciona una API del panel izquierdo para comenzar
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className={`w-80 border-l overflow-auto ${isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {selectedNode ? 'Configuración' : 'Resultado'}
                </h3>
                
                {selectedNode ? (
                  renderConfigPanel()
                ) : testResult ? (
                  <div className="space-y-3">
                    {testResult.map((result: any, idx: number) => (
                      <Card key={idx} className={`p-3 ${isDark ? 'bg-zinc-800 border-zinc-700' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {result.success ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                          <span className="font-medium text-sm">{result.node}</span>
                        </div>
                        <pre className={`text-xs overflow-auto max-h-40 p-2 rounded ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                          {JSON.stringify(result.data || result.error, null, 2)}
                        </pre>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Selecciona un nodo para configurarlo o ejecuta el workflow para ver resultados.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4">
            <Card className={`flex-1 flex flex-col ${isDark ? 'bg-zinc-800 border-zinc-700' : ''}`}>
              <ScrollArea className="flex-1 p-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Bot className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <h3 className="text-xl font-semibold mb-2">Asistente de Programación IA</h3>
                      <p className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                        Pregúntame sobre código, APIs, o cómo usar APIBlend
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-xl ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : isDark ? 'bg-zinc-700' : 'bg-zinc-100'
                        }`}>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {msg.content.split('\n').map((line, i) => (
                              <p key={i} className="mb-1 last:mb-0">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-zinc-700' : 'bg-zinc-100'}`}>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className={`p-4 border-t ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    className={isDark ? 'bg-zinc-900 border-zinc-700 text-white' : ''}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage} disabled={isChatLoading} className="bg-purple-600 hover:bg-purple-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <div className={`fixed bottom-4 left-4 px-3 py-1.5 rounded-full text-xs flex items-center gap-2 ${isDark ? 'bg-black/80 text-white border border-white/10' : 'bg-white/80 text-zinc-900 border border-zinc-200'}`}>
        <Zap className="w-3 h-3 text-blue-500" />
        <span>powered by <strong>TEAM ABQ</strong></span>
      </div>
    </div>
  )
}
