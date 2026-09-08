import pytest

from services.jobs import CANONICAL_JOB_TRANSITIONS, InvalidJobTransition, validate_job_transition
from pydantic import ValidationError
from routers.jobs import JobUpdate


def test_canonical_job_transitions_require_quality_gate_before_completion():
    assert "completed" not in CANONICAL_JOB_TRANSITIONS["scheduled"]
    assert "completed" not in CANONICAL_JOB_TRANSITIONS["in_progress"]
    assert "completed" not in CANONICAL_JOB_TRANSITIONS["completion_submitted"]
    assert "completed" in CANONICAL_JOB_TRANSITIONS["quality_approved"]


@pytest.mark.parametrize(
    ("previous_status", "new_status"),
    [
        ("scheduled", "in_progress"),
        ("in_progress", "completion_submitted"),
        ("completion_submitted", "quality_approved"),
        ("quality_approved", "completed"),
        ("completed", "reopened"),
    ],
)
def test_valid_job_transitions(previous_status, new_status):
    validate_job_transition(previous_status, new_status)


@pytest.mark.parametrize(
    ("previous_status", "new_status"),
    [
        ("scheduled", "completed"),
        ("in_progress", "completed"),
        ("completed", "scheduled"),
        ("cancelled", "completed"),
    ],
)
def test_invalid_job_transitions_fail_closed(previous_status, new_status):
    with pytest.raises(InvalidJobTransition):
        validate_job_transition(previous_status, new_status)


def test_generic_job_update_rejects_status_changes():
    with pytest.raises(ValidationError):
        JobUpdate.model_validate({"status": "completed"})
