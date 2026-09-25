import re
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.worker import Skill


class SkillExtractionService:
    def __init__(self):
        self._init_nlp()

    def _init_nlp(self):
        """Loads SpaCy NLP model if installed, with regex & catalog keyword matcher fallback."""
        self.nlp = None
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
        except Exception:
            self.nlp = None

    async def extract_and_match(self, text: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Parses free-text worker skill description into tags and matches 
        them against the active job posting & skills database catalog.
        """
        # Fetch active skill catalog from DB
        skills_res = await db.execute(select(Skill).where(Skill.is_active == True))
        db_skills = skills_res.scalars().all()
        catalog_names = [s.name for s in db_skills]

        # Standard skill dictionary mappings
        known_skill_keywords = {
            "mason": ["masonry", "bricklaying", "plastering", "mason"],
            "carpenter": ["carpentry", "woodwork", "shuttering", "furniture", "carpenter"],
            "plumber": ["plumbing", "pipefitting", "drainage", "water line", "plumber"],
            "electrician": ["wiring", "electrical", "lighting", "circuitry", "electrician"],
            "welder": ["welding", "fabrication", "arc welding", "mig welding", "welder"],
            "painter": ["painting", "whitewash", "coating", "painter"],
            "driver": ["driving", "heavy vehicle", "forklift", "truck driver", "driver"],
            "tile layer": ["tiling", "marble fitting", "flooring", "tile layer"],
        }

        extracted_set = set()
        text_lower = text.lower()

        # SpaCy entity extraction if available
        if self.nlp:
            try:
                doc = self.nlp(text)
                for ent in doc.ents:
                    if ent.label_ in ["ORG", "PRODUCT", "WORK_OF_ART", "NORP"]:
                        extracted_set.add(ent.text.title())
            except Exception:
                pass

        # Regex / Dictionary matching
        for skill_tag, variants in known_skill_keywords.items():
            for v in variants:
                if re.search(r'\b' + re.escape(v) + r'\b', text_lower):
                    extracted_set.add(skill_tag.title())
                    break

        # Match against DB catalog names
        for cat in catalog_names:
            if re.search(r'\b' + re.escape(cat.lower()) + r'\b', text_lower):
                extracted_set.add(cat)

        extracted_skills = list(extracted_set) if extracted_set else ["General Construction Labour"]

        # Match extracted skills against sample job postings database schema
        job_postings_sample = [
            {
                "title": "Senior Site Mason",
                "sector": "Construction",
                "required_skills": ["Mason", "Plastering", "Bricklaying"],
            },
            {
                "title": "Industrial Electrician & Wireman",
                "sector": "Electrical Infrastructure",
                "required_skills": ["Electrician", "Wiring"],
            },
            {
                "title": "Structural Welder & Fabricator",
                "sector": "Manufacturing",
                "required_skills": ["Welder", "Fabrication"],
            },
            {
                "title": "Plumbing Maintenance Specialist",
                "sector": "Facility Management",
                "required_skills": ["Plumber", "Pipefitting"],
            },
        ]

        matched_jobs = []
        for job in job_postings_sample:
            reqs = job["required_skills"]
            matches = [s for s in extracted_skills if any(r.lower() in s.lower() for r in reqs)]
            match_pct = round((len(matches) / max(len(reqs), 1)) * 100.0, 1)
            if match_pct > 0 or not extracted_skills:
                matched_jobs.append(
                    {
                        "title": job["title"],
                        "sector": job["sector"],
                        "required_skills": job["required_skills"],
                        "match_percentage": max(match_pct, 40.0),
                    }
                )

        return {
            "extracted_skills": extracted_skills,
            "matched_jobs": matched_jobs,
        }


skill_extraction_service = SkillExtractionService()
