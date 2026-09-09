import hashlib
import json

PILOT_SCOPE_VERSION = "PILOT-HOME-VISIT-v1"
PILOT_SCOPE_HASH = "1e7b4e3047f8fe32cd1cc4399ba4df35e810880fc5bdc933599dc09836a8ca81"
TASK_DEFINITION_VERSION = "PILOT-TASKS-v1"
PILOT_TERMS = "PILOT-HOME-VISIT-v1 · Harish only · Monday–Thursday 09:00–17:00 Asia/Jerusalem · final schedule requires owner confirmation."
PILOT_EXCLUSIONS = "No electrical, plumbing, gas, HVAC, structural, glazing, lock/security, wall-penetration, powered-drilling, new-anchor, hazardous, licensed-trade, or two-person-lift work. No additional task is included."

PILOT_TASK_DEFINITIONS = {
    "mounting_under_5kg": {
        "scope": "Mount one customer-supplied interior item weighing no more than 5 kg, using an existing verified fixing only; owner onsite.",
        "confirmations": ["customer_supplied_item", "feet_on_floor", "dry_interior_location", "non_utility_zone", "existing_verified_fixing", "no_wall_penetration", "no_powered_drilling", "no_new_anchors"],
    },
    "flat_pack_under_25kg": {
        "scope": "Assemble one customer-supplied flat-pack component weighing no more than 25 kg from its manufacturer instructions; owner onsite.",
        "confirmations": ["customer_supplied_components", "manufacturer_instructions_available", "no_structural_anchor", "no_utilities", "no_structural_alteration", "no_two_person_lift"],
    },
    "cabinet_hardware": {
        "scope": "Replace or adjust one specified customer-supplied cabinet or drawer hardware item; owner onsite.",
        "confirmations": ["specific_hardware_only", "no_locks_security_doors_windows_glazing", "no_utilities"],
    },
}


def canonical_pilot_quote_contract(task_key: str) -> tuple[str, str, str]:
    return PILOT_TASK_DEFINITIONS[task_key]["scope"], PILOT_EXCLUSIONS, PILOT_TERMS


def task_definition_hash(task_key: str) -> str:
    payload = {
        "definition_version": TASK_DEFINITION_VERSION,
        "scope_version": PILOT_SCOPE_VERSION,
        "scope_hash": PILOT_SCOPE_HASH,
        "task_key": task_key,
        "scope": PILOT_TASK_DEFINITIONS[task_key]["scope"],
        "exclusions": PILOT_EXCLUSIONS,
        "confirmations": PILOT_TASK_DEFINITIONS[task_key]["confirmations"],
    }
    return hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def confirmation_set_hash() -> str:
    return hashlib.sha256(json.dumps(sorted(CAPABILITY_ACKNOWLEDGEMENTS), separators=(",", ":")).encode()).hexdigest()


CAPABILITY_ACKNOWLEDGEMENTS = frozenset({
    "supervised_trial_passed", "canonical_scope_followed", "offer_pin_evidence_drill_passed",
    "unsafe_stop_drill_passed", "completion_scope_change_drill_passed", "no_unresolved_conditions",
})
CAPABILITY_CONFIRMATION_SET_VERSION = "CAPABILITY-CONFIRMATIONS-v1"
