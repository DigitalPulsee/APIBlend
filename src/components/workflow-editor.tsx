'use client'

import { useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Save, 
  Play, 
  X, 
  Plus,
  CreditCard,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  Webhook
} from 'lucide-react'

interface WorkflowEditorProps {
  onClose: () => void
}

const apiNodes = [
  { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'bg-purple-500' },
  { id: 'gmail', name: 'Gmail', icon: Mail, color: 'bg-red-500' },
  { id: 'slack', name: 'Slack', icon: MessageSquare, color: 'bg-pink-500' },
  { id: 'sheets', name: 'Google Sheets', icon: FileSpreadsheet, color: 'bg-green-500' },
  { id: 'webhook', name: 'Webhook', icon: Webhook, color: 'bg-blue-500' },
]

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export function WorkflowEditor({ onClose }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [workflowName, setWorkflowName] = useState('Mi Workflow')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const addNode = (apiId: string, apiName: string) => {
    const newNode: Node = {
      id: `${apiId}-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: (
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="font-medium">{apiName}</span>
          </div>
        )
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleSave = async () => {
    console.log('Guardando workflow:', { name: workflowName, nodes, edges })
    alert('Workflow guardado exitosamente')
  }

  const handleTest = async () => {
    console.log('Probando workflow:', { name: workflowName, nodes, edges })
    alert('Ejecutando prueba del workflow...')
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-xl font-bold bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleTest} variant="outline" className="border-zinc-700">
            <Play className="w-4 h-4 mr-2" />
            Probar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[250px_1fr] gap-4 h-[calc(100%-60px)]">
        <Card className="p-4 bg-zinc-800 border-zinc-700 overflow-y-auto">
          <h3 className="text-sm font-semibold text-white mb-4">APIs Disponibles</h3>
          <div className="space-y-2">
            {apiNodes.map((api) => (
              <button
                key={api.id}
                onClick={() => addNode(api.id, api.name)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-700 transition-colors text-left border border-zinc-700"
              >
                <div className={`${api.color} p-2 rounded-lg`}>
                  <api.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{api.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-700">
            <h3 className="text-sm font-semibold text-white mb-3">Instrucciones</h3>
            <div className="text-xs text-zinc-400 space-y-2">
              <p>1. Selecciona una API del panel</p>
              <p>2. Arrastra los nodos en el canvas</p>
              <p>3. Conecta los nodos arrastrando desde los puntos</p>
              <p>4. Guarda y prueba tu workflow</p>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node)}
            fitView
            className="bg-zinc-900"
          >
            <Background className="bg-zinc-900" />
            <Controls className="bg-zinc-800 border-zinc-700" />
            <MiniMap className="bg-zinc-800 border-zinc-700" />
          </ReactFlow>
        </Card>
      </div>
    </div>
  )
}
