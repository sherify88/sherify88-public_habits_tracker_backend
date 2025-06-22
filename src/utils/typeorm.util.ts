import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, EntityTarget, FindOptionsSelect, ObjectLiteral } from "typeorm";

@Injectable()
export class TypeormUtil {
  constructor(
    @InjectEntityManager()
    private manager : EntityManager,
  ) { }

  // TODO PROPERTY_NAME_AUTO_COMPLETE
  generateFindOptionsSelect<T extends ObjectLiteral>(target: EntityTarget<T>, options: {exclude?: string[]} = {}) {
    const {exclude = []} = options;
    const repo = this.manager.getRepository<T>(target);
    const propNames: string[] = repo.metadata.columns.map(x => x.propertyName);
    const select: FindOptionsSelect<ObjectLiteral> = propNames.map(p => ({[p]: !exclude.includes(p)})).reduce((prev, curr) => ({...prev, ...curr}), {});
    return select;
  }
}