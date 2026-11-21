export abstract class Entity<TId, TProps> {
  protected readonly _id: TId;
  protected readonly props: TProps;

  protected constructor(id: TId, props: TProps) {
    this._id = id;
    this.props = props;
  }

  get id(): TId {
    return this._id;
  }

  equals(other?: Entity<TId, TProps>): boolean {
    if (!other) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this._id === other._id;
  }
}
