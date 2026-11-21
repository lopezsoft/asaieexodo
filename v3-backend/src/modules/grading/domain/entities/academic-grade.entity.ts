import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base';
import { GradingScore } from '../strategies/grading-calculation.strategy';

export interface AcademicGradeProps {
  readonly schoolId: bigint;
  readonly academicYear: number;
  readonly enrollmentId: bigint;
  readonly courseAssignmentId: bigint;
  readonly periodNumber: number;
  readonly finalScore: GradingScore;
  readonly lostScore: GradingScore | null;
  readonly recoveryScore: GradingScore | null;
  readonly isLeveled: boolean;
  readonly leveledAt: string | null;
  readonly nationalScaleId: number | null;
  readonly justifiedAbsences: number;
  readonly unjustifiedAbsences: number;
  readonly lateArrivals: number;
  readonly hasPreReportAlert: boolean;
}

/**
 * Agregado Raiz que unifica las antiguas 4 tablas de notas (nscp00, nscp001, nscp002, nscp003)
 * 100% alineado con la tabla particionada `academic_scores` en PostgreSQL 17.
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
    const rec = this.props.recoveryScore?.value ?? 0;
    return rec > 0 ? rec : this.props.finalScore.value;
  }

  toPrimitives(): Record<string, unknown> {
    return {
      id: Number(this.id),
      schoolId: Number(this.props.schoolId),
      academicYear: this.props.academicYear,
      enrollmentId: Number(this.props.enrollmentId),
      courseAssignmentId: Number(this.props.courseAssignmentId),
      periodNumber: this.props.periodNumber,
      finalScore: this.props.finalScore.value,
      lostScore: this.props.lostScore?.value ?? null,
      recoveryScore: this.props.recoveryScore?.value ?? null,
      isLeveled: this.props.isLeveled,
      leveledAt: this.props.leveledAt,
      effectiveScore: this.effectiveScore,
      nationalScaleId: this.props.nationalScaleId,
      justifiedAbsences: this.props.justifiedAbsences,
      unjustifiedAbsences: this.props.unjustifiedAbsences,
      lateArrivals: this.props.lateArrivals,
      hasPreReportAlert: this.props.hasPreReportAlert,
    };
  }
}
