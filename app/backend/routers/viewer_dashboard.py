"""A deliberately limited, privacy-safe view of the live manager dashboard."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_dashboard_viewer
from schemas.auth import UserResponse
from services.jobs import JobsService
from services.leads import LeadsService
from services.partners import PartnersService
from services.services import ServicesService

router = APIRouter(prefix="/api/v1/viewer", tags=["viewer"])


def _masked_customer(index: int) -> str:
    return f"Customer {index:03d}"


@router.get("/dashboard")
async def viewer_dashboard(
    _viewer: UserResponse = Depends(get_dashboard_viewer),
    db: AsyncSession = Depends(get_db),
):
    """Return live totals and workflow state without private contact or financial data."""
    leads = await LeadsService(db).get_list(limit=100, sort="-created_at")
    jobs = await JobsService(db).get_list(limit=200, sort="-created_at")
    partners = await PartnersService(db).get_list(limit=200, sort="sort_order")
    services = await ServicesService(db).get_list(limit=200, sort="sort_order")

    masked_leads = []
    lead_names = {}
    for index, lead in enumerate(leads["items"], start=1):
        customer_name = _masked_customer(index)
        lead_names[lead.id] = customer_name
        masked_leads.append({
            "id": lead.id,
            "customer_name": customer_name,
            "phone": "Only Aviel can see this",
            "whatsapp": None,
            "email": None,
            "area": "Harish area",
            "service_requested": lead.service_requested,
            "description": "Only Aviel can see this",
            "source": lead.source,
            "status": lead.status,
            "assignment": lead.assignment,
            "assigned_partner_id": lead.assigned_partner_id,
            "quote_status": lead.quote_status,
            "booking_status": lead.booking_status,
            "follow_up_status": lead.follow_up_status,
            "follow_up_date": lead.follow_up_date,
            "notes": "Only Aviel can see this",
            "outcome": lead.outcome,
            "priority": lead.priority,
            "created_at": lead.created_at,
            "updated_at": lead.updated_at,
        })

    masked_jobs = []
    for index, job in enumerate(jobs["items"], start=1):
        masked_jobs.append({
            "id": job.id,
            "lead_id": job.lead_id,
            "provider_id": job.provider_id,
            "customer_name": lead_names.get(job.lead_id, _masked_customer(index)),
            "title": job.title,
            "phone": "Only Aviel can see this",
            "address": "Only Aviel can see this",
            "status": job.status,
            "scheduled_for": job.scheduled_for,
            "price": None,
            "notes": "Only Aviel can see this",
            "created_at": job.created_at,
            "updated_at": job.updated_at,
        })

    masked_partners = [{
        "id": partner.id,
        "name": partner.name,
        "business_type": partner.business_type,
        "description_en": partner.description_en,
        "description_he": partner.description_he,
        "phone": "Only Aviel can see this",
        "whatsapp": None,
        "email": None,
        "address": None,
        "area": partner.area,
        "partner_type": partner.partner_type,
        "is_active": partner.is_active,
        "sort_order": partner.sort_order,
        "created_at": partner.created_at,
        "updated_at": partner.updated_at,
    } for partner in partners["items"]]

    return {
        "mode": "read_only",
        "leads": {**leads, "items": masked_leads},
        "jobs": {**jobs, "items": masked_jobs},
        "partners": {**partners, "items": masked_partners},
        "services": services,
    }
