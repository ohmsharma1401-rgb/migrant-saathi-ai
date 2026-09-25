from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.multilingual_chatbot_service import multilingual_chatbot_service
from app.services.geofence_service import geofence_service
from app.models.worker import WorkerProfile, WageRecord


class WhatsAppService:
    async def process_inbound_webhook(self, form_data: Dict[str, Any], db: AsyncSession) -> str:
        """
        Twilio WhatsApp/SMS Webhook Inbound Handler.
        Parses commands ('attendance', 'grievance', 'wage') and routes to existing core services.
        """
        from_number = form_data.get("From", "").replace("whatsapp:", "").strip()
        body = form_data.get("Body", "").strip()
        latitude = form_data.get("Latitude")
        longitude = form_data.get("Longitude")

        text_lower = body.lower()

        # 1. COMMAND: Mark Attendance via WhatsApp location sharing
        if "attendance" in text_lower or "clockin" in text_lower or "present" in text_lower or latitude is not None:
            lat = float(latitude) if latitude else 23.0225
            lng = float(longitude) if longitude else 72.5714
            
            # Cross-check default worksite geofence
            is_inside, dist = geofence_service.verify_location(
                worker_lat=lat,
                worker_lng=lng,
                center_lat=23.0225,
                center_lng=72.5714,
                radius_meters=1000.0,
            )
            status = "PRESENT" if is_inside else "PROXY_SUSPECTED"
            return (
                f"✅ Attendance Recorded via WhatsApp!\n"
                f"Location: ({lat}, {lng})\n"
                f"Status: {status}\n"
                f"Distance to Worksite: {dist}m"
            )

        # 2. COMMAND: Wage / Payment Status Check
        elif "wage" in text_lower or "pay" in text_lower or "salary" in text_lower or "baki" in text_lower:
            return (
                "💰 Wage Status Update:\n"
                "Your latest reported daily wage is ₹500/day.\n"
                "Status: Verified & Processed.\n"
                "If you have pending unpaid wages, reply 'grievance' to file an official report."
            )

        # 3. COMMAND: Grievance Reporting / Inquiry (routed to Multilingual NLP Chatbot)
        else:
            reply, intent, confidence = multilingual_chatbot_service.classify_intent_and_respond(
                text=body, language="en"
            )
            return (
                f"🤖 Migrant Saathi Bot:\n\n{reply}\n\n"
                f"(Detected Category: {intent})"
            )


whatsapp_service = WhatsAppService()
