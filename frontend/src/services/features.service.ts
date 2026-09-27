import api from './api'

export interface FaceEnrollPayload {
  worker_id: string
  image_base64: string
}

export interface AttendanceVerifyPayload {
  worker_id: string
  image_base64: string
  worksite_id?: string
  latitude?: number
  longitude?: number
  blink_count?: number
  head_turn_detected?: boolean
}

export interface MultilingualChatPayload {
  query?: string
  language?: string
  audio_base64?: string
}

export interface DocumentOCRPayload {
  image_base64: string
  document_type?: string
}

export const featuresService = {
  // 1 & 2. Attendance & Geofencing
  async enrollFace(workerId: string, imageBase64: string) {
    const res = await api.post('/attendance/enroll-face', {
      worker_id: workerId,
      image_base64: imageBase64,
    })
    return res.data
  },

  async verifyAttendance(payload: AttendanceVerifyPayload) {
    const res = await api.post('/attendance/verify', payload)
    return res.data
  },

  // 3 & 4. Admin Anomalies & Predictive Risk Scoring
  async listAnomalies() {
    const res = await api.get('/admin/anomalies')
    return res.data
  },

  async runAnomalyScan() {
    const res = await api.post('/admin/anomalies/run')
    return res.data
  },

  async getRiskScore(workerId: string) {
    const res = await api.get(`/admin/risk-score/${workerId}`)
    return res.data
  },

  // 5. Multilingual Chatbot & Voice
  async queryChatbot(payload: MultilingualChatPayload) {
    const res = await api.post('/chatbot/query', payload)
    return res.data
  },

  // 6. Skill Extraction & Matching
  async extractAndMatchSkills(text: string) {
    const res = await api.post('/skills/extract-and-match', { text })
    return res.data
  },

  // 7. Document OCR
  async extractDocumentOCR(imageBase64: string, documentType = 'aadhaar') {
    const res = await api.post('/documents/ocr-extract', {
      image_base64: imageBase64,
      document_type: documentType,
    })
    return res.data
  },

  // 8. WhatsApp Bot Simulator
  async sendWhatsAppWebhook(body: string, fromNumber = '919876543210', lat?: number, lng?: number) {
    const params = new URLSearchParams()
    params.append('Body', body)
    params.append('From', `whatsapp:${fromNumber}`)
    if (lat) params.append('Latitude', lat.toString())
    if (lng) params.append('Longitude', lng.toString())

    const res = await api.post('/whatsapp/webhook', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return res.data
  },
}
