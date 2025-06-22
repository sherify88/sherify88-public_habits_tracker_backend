import { BadRequestException } from '@nestjs/common';
export enum PostgresErrorCode {
  UNIQUE_VIOLATION = '23505',
  FK_VIOLATION = '23503',
  NOT_NUL_VIOLATION = '23502',
  UNUQUE_VIOLATION = "UNUQUE_VIOLATION"
}
export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}
export class BadRequest {
  static readonly VALIDATION = (field, message?: string) =>
    new BadRequestException({
      code: 0,
      message: message ?? 'invalid value',
      field,
    });

  static readonly INVALID_LOGIN = (message?: string) =>
    new BadRequestException({
      code: 1,
      message: message ?? 'wrong credentials provided',
    });

    static readonly REJECTED_FILE = (
      supportedTypes?: string[],
      message?: string,
    ) =>
      new BadRequestException({
        code: 6,
        message: message ?? 'file type not supported',
        supportedTypes,
      });
      
  }

  export class BadRequestResponseBody {
    static readonly UNIQUE_VIOLATION = (detail: any) => ({
      code: 3,
      message: 'already exist',
      detail,
    });
    static readonly FK_VIOLATION = (detail: any, relation: string) => ({
      code: 4,
      message: 'resource referenced from a relation',
      relation,
      detail,
    });
  }