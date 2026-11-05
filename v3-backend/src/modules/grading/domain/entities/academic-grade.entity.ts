import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { GradingScore } from '../strategies/grading-calculation.strategy';

export interface AcademicGradeProps {
  readonly schoolId: bigint;
  readonly academicYear: number;
  readonly enrollmentId: bigint;
  readonly courseAssignmentId: bigint;
  readonly academicPeriodId: bigint;
  readonly finalScore: GradingScore;
  readonly remedialScore: GradingScore;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly tardies: number;
  readonly preReportObservation: string | null;
  readonly hasPreReportAlert: boolean;
  readonly updatedByUserId: bigint;
}

/**
 * Agregado Raiz que unifica las antiguas 4 tablas de notas (nscp00, nscp001, nscp002, nscp003).
 */
export class AcademicGrade extends AggregateRoot<bigint, AcademicGradeProps> {
  private constructor(id: bigint, props: AcademicGradeProps) {
    super(id, props);
  }

  static createOrUpdate(
    id: bigint,
    props: AcademicGradeProps,
  ): AcademicGrade {
    return new AcademicGrade(id, props);
  }

  get effectiveScore(): number {
    return Math.max(
      this.props.finalScore.value,
      this.props.remedialScore.value,
    );
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: Number(this.id),
      schoolId: Number(this.props.schoolId),
      academicYear: this.props.academicYear,
      enrollmentId: Number(this.props.enrollmentId),
      courseAssignmentId: Number(this.props.courseAssignmentId),
      academicPeriodId: Number(this.props.academicPeriodId),
      finalScore: this.props.finalScore.value,
      remedialScore: this.props.remedialScore.value,
      effectiveScore: this.effectiveScore,
      justifiedAbsences: this.props.justifiedAbsences,
      unjustifiedAbsences: this.props.unjustifiedAbsences,
      tardies: this.props.tardies,
      preReportObservation: this.props.preReportObservation,
      hasPreReportAlert: this.props.hasPreReportAlert,
    };
  }
}
