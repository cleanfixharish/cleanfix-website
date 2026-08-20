import pytest
from pydantic import ValidationError

from routers.pricing import (
    EstimateCreate,
    local_guidance_is_ready,
    observation_can_support_estimate,
)
from services.pricing_baseline import OBSERVATIONS, SOURCES


def test_every_observation_points_to_a_known_source():
    source_keys = {source["source_key"] for source in SOURCES}
    assert all(observation[1] in source_keys for observation in OBSERVATIONS)


def test_only_verified_observations_can_support_estimates():
    for observation in OBSERVATIONS:
        validation_status = observation[7]
        eligible = observation[8]
        assert observation_can_support_estimate(validation_status, eligible) is (
            validation_status == "verified" and eligible is True
        )


def test_all_midrag_rows_are_verified_after_manual_validation():
    midrag_rows = [row for row in OBSERVATIONS if row[0].startswith("NAT_MID_")]
    assert len(midrag_rows) == 8
    assert all(row[7] == "verified" and row[8] is True for row in midrag_rows)
    assert all(row[9] == "VAT unspecified" for row in midrag_rows)


def test_local_guidance_requires_five_approved_comparable_samples():
    assert local_guidance_is_ready(4) is False
    assert local_guidance_is_ready(5) is True


def test_estimate_rejects_inverted_customer_range():
    with pytest.raises(ValidationError):
        EstimateCreate(
            observation_id=1,
            service_description="Mount two shelves in the living room.",
            geography="Harish",
            customer_min=400,
            customer_max=300,
        )
