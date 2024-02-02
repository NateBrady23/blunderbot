/**
 * An exception thrown when a user tries to update an entity that must not be
 * updated.
 *
 * Prefer throwing subtypes of this exception for specific situations, such as
 * {@link ArchivedEntityNotUpdatableError}.
 */
export class EntityNotUpdatableError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/**
 * An exception thrown when someone tries to update an entity that is archived.
 *
 * In general, deleting an entity is always permitted and does not result in
 * this exception being thrown.
 */
export class ArchivedEntityNotUpdatableError extends EntityNotUpdatableError {
  constructor(message: string) {
    super(message);
  }
}
