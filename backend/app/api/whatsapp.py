from fastapi import APIRouter, Request, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.services.whatsapp_service import whatsapp_service

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


@router.post("/webhook")
async def twilio_whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    form_data = await request.form()
    data_dict = dict(form_data)

    reply_text = await whatsapp_service.process_inbound_webhook(form_data=data_dict, db=db)

    # Return Twilio TwiML XML Response
    twiml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>{reply_text}</Message>
</Response>"""
    return Response(content=twiml_response, media_type="application/xml")
