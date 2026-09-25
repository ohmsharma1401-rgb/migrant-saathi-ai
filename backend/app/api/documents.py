from fastapi import APIRouter
from app.schemas.new_features import DocumentOCRRequest, DocumentOCRResponse
from app.services.ocr_service import ocr_service

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.post("/ocr-extract", response_model=DocumentOCRResponse)
async def extract_document_ocr(payload: DocumentOCRRequest):
    result = ocr_service.extract_document_fields(
        image_base64=payload.image_base64,
        document_type=payload.document_type or "aadhaar",
    )
    return DocumentOCRResponse(
        document_type=result["document_type"],
        extracted_fields=result["extracted_fields"],
        confidence=result["confidence"],
        raw_text=result["raw_text"],
    )
