import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { GradingScore } from '../strategies/grading-calculation.strategy';

export interface AcademicGradeProps {
  readonly schoolId: bigint;
  readonly academicYear: number;
  readonly enrollmentId: bigint;
  readonly courseAssignmentId: bigint;
  readonly periodId: bigint;
  readonly periodNumber: number;
  readonly finalScore: GradingScore;
  readonly recoveryScore: GradingScore | null;
  readonly levelingScore: GradingScore | null;
  readonly nationalScaleId: number | null;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly lateArrivals: number;
  readonly teacherObservations: string | null;
  readonly hasPreReportAlert: boolean;
  readonly isLocked: boolean;
  readonly updatedByUserId: bigint;
}

/**
 * Agregado Raiz que unifica las antiguas 4 tablas de notas (nscp00, nscp001, nscp002, nscp003)
 * 100% alineado con la tabla particionada `academic_grades` en PostgreSQL 17.
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
      this.props.recoveryScore?.value ?? 0,
      this.props.levelingScore?.value ?? 0,
    );
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: Number(this.id),
      schoolId: Number(this.props.schoolId),
      academicYear: this.props.academicYear,
      enrollmentId: Number(this.props.enrollmentId),
      courseAssignmentId: Number(this.props.courseAssignmentId),
      periodId: Number(this.props.periodId),
      periodNumber: this.props.periodNumber,
      finalScore: this.props.finalScore.value,
      recoveryScore: this.props.recoveryScore?.value ?? 0,
      levelingScore: this.props.levelingScore?.value ?? 0,
      effectiveScore: this.effectiveScore,
      nationalScaleId: this.props.nationalScaleId,
      justifiedAbsences: this.props.justifiedAbsences,
      unjustifiedAbsences: this.props.unjustifiedAbsences,
      lateArrivals: this.props.lateArrivals,
      teacherObservations: this.props.teacherObservations,
      hasPreReportAlert: this.props.hasPreReportAlert,
      isLocked: this.props.isLocked,
    };
  }
}
