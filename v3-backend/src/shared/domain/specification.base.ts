export interface Specification<TCandidate> {
  isSatisfiedBy(candidate: TCandidate): boolean;
  and(other: Specification<TCandidate>): Specification<TCandidate>;
  or(other: Specification<TCandidate>): Specification<TCandidate>;
}

export abstract class CompositeSpecification<TCandidate>
  implements Specification<TCandidate>
{
  abstract isSatisfiedBy(candidate: TCandidate): boolean;

  and(other: Specification<TCandidate>): Specification<TCandidate> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<TCandidate>): Specification<TCandidate> {
    return new OrSpecification(this, other);
  }
}

class AndSpecification<TCandidate> extends CompositeSpecification<TCandidate> {
  constructor(
    private readonly left: Specification<TCandidate>,
    private readonly right: Specification<TCandidate>,
  ) {
    super();
  }

  isSatisfiedBy(candidate: TCandidate): boolean {
    return (
      this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate)
    );
  }
}

class OrSpecification<TCandidate> extends CompositeSpecification<TCandidate> {
  constructor(
    private readonly left: Specification<TCandidate>,
    private readonly right: Specification<TCandidate>,
  ) {
    super();
  }

  isSatisfiedBy(candidate: TCandidate): boolean {
    return (
      this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate)
    );
  }
}
