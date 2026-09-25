import math
from typing import Tuple, Optional


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in meters between two points 
    on the earth (specified in decimal degrees) using Haversine formula.
    """
    R = 6371000.0  # Earth's radius in meters

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = R * c
    return distance


class GeofenceService:
    def verify_location(
        self,
        worker_lat: Optional[float],
        worker_lng: Optional[float],
        center_lat: float,
        center_lng: float,
        radius_meters: float,
    ) -> Tuple[bool, float]:
        """
        Validates if worker coordinates fall within worksite radius.
        Returns (is_inside: bool, distance_in_meters: float).
        """
        if worker_lat is None or worker_lng is None:
            return False, 999999.0

        dist = haversine_distance(worker_lat, worker_lng, center_lat, center_lng)
        is_inside = dist <= radius_meters
        return is_inside, round(dist, 2)


geofence_service = GeofenceService()
