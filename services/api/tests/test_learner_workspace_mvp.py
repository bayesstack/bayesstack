"""Regression coverage for the learner studio operational data model."""

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from core.database import AsyncSessionLocal
from db.models import (
    AssignmentMilestone,
    CapabilityEvidence,
    DiscussionPost,
    DiscussionReaction,
    DiscussionThread,
    Enrollment,
    LearnerAssignmentState,
    LearnerCalendarBlock,
    LearnerPreference,
    LearningAssignment,
    ProjectArtifact,
    ProjectTeam,
    ProjectTeamMember,
    SupportRequest,
)
from db.seed import seed_database


@pytest.mark.asyncio
async def test_learner_workspace_seed_forms_one_queryable_product_graph():
    await seed_database()

    async with AsyncSessionLocal() as session:
        assignments = (await session.scalars(
            select(LearningAssignment).where(LearningAssignment.tenant_id == "tenant-bayes")
        )).all()
        by_code = {row.code: row for row in assignments}
        assert {"ML401-LAB-GD", "ML401-PROJ-DECISION-MAP"} <= set(by_code)

        project = by_code["ML401-PROJ-DECISION-MAP"]
        milestones = (await session.scalars(
            select(AssignmentMilestone)
            .where(AssignmentMilestone.assignment_id == project.id)
            .order_by(AssignmentMilestone.position)
        )).all()
        assert [row.title for row in milestones] == [
            "Frame the decision",
            "Build the comparison",
            "Review the evidence",
            "Submit the recommendation",
        ]

        learner_states = (await session.scalars(
            select(LearnerAssignmentState).where(
                LearnerAssignmentState.learner_id == "user-bayes-learner"
            )
        )).all()
        assert len(learner_states) >= 2
        assert all(row.status == "in_progress" for row in learner_states)

        team = (await session.scalars(
            select(ProjectTeam).where(ProjectTeam.assignment_id == project.id)
        )).one()
        members = (await session.scalars(
            select(ProjectTeamMember).where(ProjectTeamMember.project_team_id == team.id)
        )).all()
        artifacts = (await session.scalars(
            select(ProjectArtifact).where(ProjectArtifact.project_team_id == team.id)
        )).all()
        assert {row.role for row in members} == {"lead", "mentor"}
        assert {row.artifact_type for row in artifacts} == {"document", "notebook"}

        thread = (await session.scalars(
            select(DiscussionThread).where(
                DiscussionThread.created_by_user_id == "user-bayes-learner"
            )
        )).one()
        posts = (await session.scalars(
            select(DiscussionPost).where(DiscussionPost.thread_id == thread.id)
        )).all()
        reactions = (await session.scalars(
            select(DiscussionReaction).where(
                DiscussionReaction.post_id.in_([post.id for post in posts])
            )
        )).all()
        assert thread.status == "resolved"
        assert thread.accepted_post_id in {post.id for post in posts}
        assert len(reactions) == 1

        blocks = (await session.scalars(select(LearnerCalendarBlock))).all()
        evidence = (await session.scalars(select(CapabilityEvidence))).all()
        preferences = (await session.scalars(select(LearnerPreference))).all()
        support = (await session.scalars(select(SupportRequest))).all()
        assert any(row.source_type == "assignment" for row in blocks)
        assert {row.dimension for row in evidence} >= {
            "problem_solving",
            "technical_execution",
            "communication",
        }
        assert preferences[0].accessibility["keyboard_hints"] is True
        assert support[0].context["route"] == "/labs"


@pytest.mark.asyncio
async def test_assignment_state_enforces_learner_ownership_and_progress_range():
    await seed_database()

    async with AsyncSessionLocal() as session:
        assignment = (await session.scalars(select(LearningAssignment))).first()
        enrollment = (await session.scalars(
            select(Enrollment).where(Enrollment.student_id == "user-bayes-learner")
        )).first()
        assert assignment is not None
        assert enrollment is not None

        invalid = LearnerAssignmentState(
            tenant_id="tenant-bayes",
            assignment_id=assignment.id,
            enrollment_id=enrollment.id,
            learner_id="user-bayes-faculty",
            progress_percent=120,
        )
        session.add(invalid)
        with pytest.raises(IntegrityError):
            await session.commit()
