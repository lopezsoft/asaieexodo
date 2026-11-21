export abstract class ValueObject<TProps> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  equals(other?: ValueObject<TProps>): boolean {
    if (!other || other.props === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
