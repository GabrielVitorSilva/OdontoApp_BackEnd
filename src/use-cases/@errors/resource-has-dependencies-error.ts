export class ResourceHasDependenciesError extends Error {
  constructor(resourceName: string) {
    super(
      `Não é possível excluir este ${resourceName} pois existem registros vinculados a ele.`,
    )
  }
}
