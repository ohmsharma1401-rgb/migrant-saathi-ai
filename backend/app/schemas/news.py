from typing import List, Optional
from pydantic import BaseModel


class NewsAlert(BaseModel):
    id: str
    level: str  # 'urgent' | 'warning' | 'info'
    title: str
    description: str
    date: str
    action_link: Optional[str] = None
    action_text: Optional[str] = None


class OfficialLink(BaseModel):
    label: str
    url: str


class NewsArticle(BaseModel):
    id: str
    title: str
    slug: str
    summary: str
    content: str
    category: str
    image_url: str
    source: str
    published_at: str
    relative_time: str
    state: str
    district: str
    is_featured: bool = False
    key_takeaways: List[str] = []
    action_steps: List[str] = []
    official_links: List[OfficialLink] = []
    related_schemes: List[str] = []
    tags: List[str] = []


class NewsListResponse(BaseModel):
    featured: Optional[NewsArticle] = None
    articles: List[NewsArticle] = []
    alerts: List[NewsAlert] = []
    categories: List[str] = []
    districts: List[str] = []
    total: int = 0
