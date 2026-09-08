from core.database import Base
from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Identity, Integer, String, Text, UniqueConstraint, func


class BusinessRelationship(Base):
    """Owner-controlled access to one of the isolated business portals.

    A self-declared business account is only an application.  Portal access is
    granted by an active relationship row and is never inferred from the user's
    generic account type or JWT role.
    """

    __tablename__ = "business_relationships"
    __table_args__ = (
        UniqueConstraint("user_id", "relationship_type", name="uq_business_relationship_user_type"),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        String(255),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    relationship_type = Column(String(40), nullable=False, index=True)
    status = Column(String(20), nullable=False, server_default="pending", index=True)
    approved_by = Column(String(255), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class BusinessRelationshipEvent(Base):
    """Append-only record of owner access decisions; contains no profile PII."""

    __tablename__ = "business_relationship_events"

    id = Column(BigInteger, Identity(), primary_key=True)
    relationship_id = Column(
        Integer,
        ForeignKey("business_relationships.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    actor_id = Column(String(255), nullable=False)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
