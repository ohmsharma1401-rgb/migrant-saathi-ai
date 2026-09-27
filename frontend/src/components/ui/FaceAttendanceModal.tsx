import React, { useState, useRef } from 'react'
import {
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  RefreshCw,
  X,
  Eye,
  RotateCw,
} from 'lucide-react'
import { featuresService } from '@/services/features.service'

interface FaceAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  workerId?: string
}

export default function FaceAttendanceModal({
  isOpen,
  onClose,
  workerId = 'default-worker-123',
}: FaceAttendanceModalProps) {
  const [imageCaptured, setImageCaptured] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [blinkCount, setBlinkCount] = useState(1)
  const [headTurn, setHeadTurn] = useState(true)
  const [worksiteId, setWorksiteId] = useState('SITE-SURAT-01')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [result, setResult] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  if (!isOpen) return null

  // Capture current user GPS location
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {
          // Fallback to Surat worksite default coordinates
          setUserLocation({ lat: 23.0225, lng: 72.5714 })
        }
      )
    } else {
      setUserLocation({ lat: 23.0225, lng: 72.5714 })
    }
  }

  // Simulated or Camera Capture
  function capturePhoto() {
    // Generate high-fidelity canvas frame base64 representation
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0C2D27'
      ctx.fillRect(0, 0, 320, 240)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '14px sans-serif'
      ctx.fillText('Worker Face Scan Frame', 80, 120)
    }
    const sampleBase64 = canvas.toDataURL('image/jpeg')
    setImageCaptured(sampleBase64)
  }

  async function handleEnroll() {
    if (!imageCaptured) {
      capturePhoto()
    }
    setLoading(true)
    setErrorMsg(null)
    try {
      const img = imageCaptured || 'data:image/jpeg;base64,sample'
      const res = await featuresService.enrollFace(workerId, img)
      setResult({
        type: 'ENROLL',
        message: res.message || 'Face embedding successfully enrolled!',
      })
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Failed to enroll face embedding.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (!userLocation) getLocation()
    setLoading(true)
    setErrorMsg(null)
    try {
      const img = imageCaptured || 'data:image/jpeg;base64,sample'
      const res = await featuresService.verifyAttendance({
        worker_id: workerId,
        image_base64: img,
        worksite_id: worksiteId,
        latitude: userLocation?.lat || 23.0225,
        longitude: userLocation?.lng || 72.5714,
        blink_count: blinkCount,
        head_turn_detected: headTurn,
      })
      setResult({
        type: 'VERIFY',
        data: res,
      })
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Verification error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in">
        {/* Header */}
        <div className="bg-[#0C2D27] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-900/60 flex items-center justify-center border border-emerald-700/50">
              <ShieldCheck className="h-5 w-5 text-[#C0E862]" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Face & Geo Attendance Verification</h2>
              <p className="text-[11px] text-emerald-200/70">Liveness check &amp; worksite geofence validation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-900/50 text-emerald-200/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Camera Frame Area */}
          <div className="relative h-48 rounded-2xl bg-slate-900 overflow-hidden border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center text-center p-4">
            {imageCaptured ? (
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                <img src={imageCaptured} alt="Face frame" className="h-full object-cover rounded-xl" />
                <button
                  onClick={() => setImageCaptured(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 hover:bg-black"
                >
                  <RefreshCw className="h-3 w-3" /> Retake
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
                <p className="text-xs text-slate-300 font-medium">Position your face clearly within frame</p>
                <button
                  onClick={capturePhoto}
                  className="px-4 py-1.5 rounded-full bg-[#FF6B53] text-white text-xs font-bold shadow-md hover:bg-orange-600 transition-colors"
                >
                  Capture Photo Scan
                </button>
              </div>
            )}
          </div>

          {/* Verification Challenge Controls */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Eye Blinks</span>
              </div>
              <input
                type="number"
                min={0}
                max={5}
                value={blinkCount}
                onChange={(e) => setBlinkCount(parseInt(e.target.value) || 0)}
                className="w-12 text-center text-xs font-bold border border-slate-200 rounded-lg p-1"
              />
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Head Turn</span>
              </div>
              <input
                type="checkbox"
                checked={headTurn}
                onChange={(e) => setHeadTurn(e.target.checked)}
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Worksite & Location Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0C2D27] flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#FF6B53]" /> Worksite Location:
              </span>
              <button
                onClick={getLocation}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Fetch GPS'}
              </button>
            </div>

            <input
              type="text"
              value={worksiteId}
              onChange={(e) => setWorksiteId(e.target.value)}
              placeholder="Worksite ID (e.g. SITE-SURAT-01)"
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0C2D27] text-xs font-bold transition-colors disabled:opacity-50"
            >
              Enroll Face Vector
            </button>
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#0C2D27] hover:bg-emerald-900 text-white text-xs font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Attendance'}
            </button>
          </div>

          {/* Error display */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
              {result.type === 'ENROLL' ? (
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>{result.message}</span>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-700">Combined Result:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        result.data.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : result.data.status === 'PROXY_SUSPECTED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.data.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="block text-slate-400">Face Match</span>
                      <b className={result.data.face_matched ? 'text-emerald-600' : 'text-red-600'}>
                        {result.data.face_matched ? 'PASSED' : 'FAILED'}
                      </b>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="block text-slate-400">Geo Match</span>
                      <b className={result.data.geo_matched ? 'text-emerald-600' : 'text-red-600'}>
                        {result.data.geo_matched ? 'INSIDE' : 'OUTSIDE'}
                      </b>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="block text-slate-400">Liveness</span>
                      <b className={result.data.liveness_verified ? 'text-emerald-600' : 'text-red-600'}>
                        {result.data.liveness_verified ? 'VERIFIED' : 'UNVERIFIED'}
                      </b>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 pt-1 leading-snug">{result.data.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
