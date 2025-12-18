import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { apiType, config, testData } = await request.json()

    let result: any = { success: false, data: null, error: null }

    switch (apiType) {
      case 'webhook':
        result = await executeWebhook(config, testData)
        break
      case 'http':
        result = await executeHTTP(config, testData)
        break
      case 'email':
        result = await simulateEmail(config, testData)
        break
      case 'slack':
        result = await executeSlack(config, testData)
        break
      case 'sheets':
        result = await simulateSheets(config, testData)
        break
      case 'transform':
        result = await executeTransform(config, testData)
        break
      case 'filter':
        result = await executeFilter(config, testData)
        break
      default:
        result = { success: false, error: 'API type not supported' }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error executing API' },
      { status: 500 }
    )
  }
}

async function executeWebhook(config: any, testData: any) {
  const { url, method = 'POST', headers = {} } = config

  if (!url) {
    return { success: false, error: 'URL is required for webhook' }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method !== 'GET' ? JSON.stringify(testData || {}) : undefined
    })

    const data = await response.text()
    let parsedData
    try {
      parsedData = JSON.parse(data)
    } catch {
      parsedData = data
    }

    return {
      success: response.ok,
      data: parsedData,
      status: response.status,
      statusText: response.statusText
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function executeHTTP(config: any, testData: any) {
  const { url, method = 'GET', headers = {}, body } = config

  if (!url) {
    return { success: false, error: 'URL is required' }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method !== 'GET' ? JSON.stringify(body || testData || {}) : undefined
    })

    const data = await response.text()
    let parsedData
    try {
      parsedData = JSON.parse(data)
    } catch {
      parsedData = data
    }

    return {
      success: response.ok,
      data: parsedData,
      status: response.status
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function simulateEmail(config: any, testData: any) {
  const { to, subject, body } = config

  await new Promise(resolve => setTimeout(resolve, 500))

  return {
    success: true,
    data: {
      messageId: `msg_${Date.now()}`,
      to: to || testData?.to || 'ejemplo@email.com',
      subject: subject || testData?.subject || 'Sin asunto',
      body: body || testData?.body || '',
      sentAt: new Date().toISOString(),
      status: 'sent'
    },
    message: 'Email enviado exitosamente (simulación)'
  }
}

async function executeSlack(config: any, testData: any) {
  const { webhookUrl, channel, message } = config

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: channel || '#general',
          text: message || testData?.message || 'Mensaje de prueba desde APIBlend'
        })
      })

      return {
        success: response.ok,
        data: { status: response.ok ? 'sent' : 'failed' },
        message: response.ok ? 'Mensaje enviado a Slack' : 'Error al enviar'
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  await new Promise(resolve => setTimeout(resolve, 300))
  return {
    success: true,
    data: {
      channel: channel || '#general',
      message: message || testData?.message || 'Mensaje de prueba',
      timestamp: Date.now(),
      status: 'delivered'
    },
    message: 'Mensaje enviado a Slack (simulación)'
  }
}

async function simulateSheets(config: any, testData: any) {
  const { spreadsheetId, range, values, operation = 'read' } = config

  await new Promise(resolve => setTimeout(resolve, 400))

  if (operation === 'write' || operation === 'append') {
    return {
      success: true,
      data: {
        spreadsheetId: spreadsheetId || 'sheet_' + Date.now(),
        updatedRange: range || 'A1:D10',
        updatedRows: values?.length || 1,
        updatedColumns: values?.[0]?.length || 4,
        updatedCells: (values?.length || 1) * (values?.[0]?.length || 4),
        operation
      },
      message: `Datos ${operation === 'append' ? 'agregados' : 'escritos'} en Google Sheets (simulación)`
    }
  }

  return {
    success: true,
    data: {
      spreadsheetId: spreadsheetId || 'sheet_' + Date.now(),
      range: range || 'A1:D10',
      values: [
        ['Nombre', 'Email', 'Estado', 'Fecha'],
        ['Juan Pérez', 'juan@email.com', 'Activo', '2025-01-15'],
        ['María García', 'maria@email.com', 'Pendiente', '2025-01-14'],
        ['Carlos López', 'carlos@email.com', 'Activo', '2025-01-13']
      ]
    },
    message: 'Datos leídos de Google Sheets (simulación)'
  }
}

async function executeTransform(config: any, testData: any) {
  const { transformations = [] } = config
  let data = testData || {}

  for (const transform of transformations) {
    switch (transform.type) {
      case 'map':
        if (Array.isArray(data)) {
          data = data.map((item: any) => {
            const newItem: any = {}
            for (const [key, value] of Object.entries(transform.mapping || {})) {
              newItem[key] = item[value as string]
            }
            return newItem
          })
        }
        break
      case 'pick':
        if (transform.fields && Array.isArray(transform.fields)) {
          const picked: any = {}
          for (const field of transform.fields) {
            if (data[field] !== undefined) {
              picked[field] = data[field]
            }
          }
          data = picked
        }
        break
      case 'merge':
        data = { ...data, ...transform.mergeWith }
        break
      case 'uppercase':
        if (typeof data === 'string') {
          data = data.toUpperCase()
        } else if (typeof data === 'object') {
          for (const key of Object.keys(data)) {
            if (typeof data[key] === 'string') {
              data[key] = data[key].toUpperCase()
            }
          }
        }
        break
    }
  }

  return {
    success: true,
    data,
    message: 'Datos transformados exitosamente'
  }
}

async function executeFilter(config: any, testData: any) {
  const { conditions = [], logic = 'AND' } = config
  let data = Array.isArray(testData) ? testData : [testData]

  const filtered = data.filter((item: any) => {
    const results = conditions.map((condition: any) => {
      const { field, operator, value } = condition
      const fieldValue = item[field]

      switch (operator) {
        case 'equals':
          return fieldValue === value
        case 'notEquals':
          return fieldValue !== value
        case 'contains':
          return String(fieldValue).includes(String(value))
        case 'greaterThan':
          return Number(fieldValue) > Number(value)
        case 'lessThan':
          return Number(fieldValue) < Number(value)
        case 'exists':
          return fieldValue !== undefined && fieldValue !== null
        default:
          return true
      }
    })

    return logic === 'AND' ? results.every(Boolean) : results.some(Boolean)
  })

  return {
    success: true,
    data: filtered,
    count: filtered.length,
    message: `Filtrados ${filtered.length} de ${data.length} elementos`
  }
}
