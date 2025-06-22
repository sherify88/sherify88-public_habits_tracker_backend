import { BadRequestException } from '@nestjs/common';
export enum PostgresErrorCode {
  UNIQUE_VIOLATION = '23505',
  FK_VIOLATION = '23503',
  NOT_NUL_VIOLATION = '23502',
  UNUQUE_VIOLATION = "UNUQUE_VIOLATION"
}

export enum SERVER_TYPE {
  LOCAL = 'local-server',
  DEV = 'dev-server',
  PROD = 'prod-server',
}
export enum Coupon {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}
export enum WeightTypeEnum {
  KG,
  TON,
  METER
}
export enum NotificationType {
  CHAT = 'chat',
  ANNOUNCEMENT = 'announcement',
  CREDIT_INCREASED = 'credit_increased',
  NEW_ORDER = 'new_order',
  ORDER_OUT_DELIVERY = 'order_out_delivery',
  ORDER_PAID = 'order_paid',
  ORDER_DELIVERED = 'order_delivered',
}

export const WeekDaysList: string[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
]

export enum Code_list_type {
  OPTSTICALS_TECH, OPTSTICALS_OPERATION
}


export enum IncActionStatusEnum {
  DONE = 'DONE', QUEUE = 'QUEUE', REJECT = 'REJECT', ACCEPT = 'ACCEPT'
}

export enum Shift_ar {
  MORNING = 'صباحية', Evening = 'مسائية', NIGHT = 'ليلية'
}

export enum MilliEnum {
  Second = 1000,
  Minute = 60000,
  Hour = 3600000,
  Day = 3600000 * 24,
  Week = 3600000 * 24 * 7,
}


export enum Shift_Start {
  MORNING = 14.6, NOON = 14.7, NIGHT = 18.5
}

export enum Shift_en {
  MORNING = 'MORNING', Evening = 'Evening', NIGHT = 'NIGHT'
}

export enum jobState {
  open = 'open',
  closed = 'closed',
}
export enum OS {
  ANDROID = 'Android',
  IOS = 'ios',
}

export enum ConnnectionState_Enum {
  CONNECTED = 'CONNECTED',
  DIS_CONNECTED = 'DIS_CONNECTED',
  WAITING = 'WAITING',
  NULL = 'NULL',
}
export enum NotificationTopic {
  OUT_OF_DISTRICT_EVENT = 'OUT_OF_DISTRICT_EVENT',
  ACTIVE_USERS_CONNECTION_TEST = 'ACTIVE_USERS_CONNECTION_TEST',
  CHECK_APP_VERSION = 'CHECK_APP_VERSION',
  NOTIFY_ACTIVE_USERS = 'NOTIFY_ACTIVE_USERS',
  TRAIN_MODEL = 'TRAIN_MODEL',
  CLOSE_ROUTE = 'CLOSE_ROUTE',
  RESTART_ROUTE = 'RESTART_ROUTE',
  LOGOUT = "LOGOUT"
}
export enum FCMTopic {
  Supervisor_ANNOUNCEMENT = 'merchant_announcement',
  Manager_ANNOUNCEMENT = 'sales_announcement',
  Auditor_ANNOUNCEMENT = 'general_announcement',
}

export enum LATEST_APP_VERSION {
  ANDROID = '1.0.0'
}


export enum TechnicalIssues_Ar {
  None = 'لا يوجد',
  Network = 'شبكة الاتصال',
  Application = 'التطبيق',
  Data = 'البيانات',
  GPS = 'نظام تحديد المواقع',
}
export enum TechnicalIssues_En {
  None = 'None',
  Network = 'Network',
  Application = 'Application',
  Data = 'Data',
  GPS = 'GPS',
}

export enum ViolationRouteType {
  GeneralBlock = 'GeneralBlock'
}

export enum OperationsIssues_Ar {
  None = 'لا يوجد',
  public_event = 'حدث عام',
  security_event = 'حدث أمني',
  political_event = 'حدث سياسي',
  injury_event = 'إصابة أو مشكلة صحية',
  resources = 'موارد',
  Management = 'سوء إدارة',
}
export enum OperationsIssues_En {
  None = "None",
  public_event = "public event",
  security_event = "security event",
  political_event = "political event",
  injury_event = "injury event",
  resources = 'resources',
  Management = "Management",
}
export enum StreetVioType {
  main = 'Main Street Collection',
  sub = 'Sub Street Collection'
}
export enum JOB_EVENTS_ENUM {
  out_block = 'out_block',
  in_block = 'in_block',
  out_district = 'out_district',
  in_district = 'in_district',
  extra_time = 'extra_time',
  phone_off = 'phone_off',
  Mock_Location = 'Mock_Location',
  LOGOUT = 'LOGOUT',
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

  static readonly NOT_EXIST = (fields: string[], message?: string) =>
    new BadRequestException({
      code: 2,
      message: message ?? 'resource(s) not exist',
      fields,
    });
  static readonly UNIQUE_VIOLATION = (detail: any, message?: string) =>
    new BadRequestException({
      code: 3,
      message: message ?? 'already exist',
      detail,
    });

  static readonly FK_VIOLATION = (
    detail: any,
    relation: string,
    message?: string,
  ) =>
    new BadRequestException({
      code: 4,
      message: message ?? 'resource referenced from a relation',
      relation,
      detail,
    });

  static readonly NOT_NUL_VIOLATION = (field, message?: string) =>
    new BadRequestException({
      code: 5,
      message: message ?? 'required field',
      field,
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

  static readonly EMPTY_CART = (message?: string) =>
    new BadRequestException({
      code: 7,
      message: message ?? 'empty shopping cart',
    });

  static readonly INVALID_COUPON = (message?: string) =>
    new BadRequestException({
      code: 8,
      message: message ?? 'invalid coupon',
    });

  static readonly NO_SALES_REP = (message?: string) =>
    new BadRequestException({
      code: 9,
      message: message ?? 'order not assigned to a sales representative',
    });

  static readonly LOW_CREDIT = (message?: string) =>
    new BadRequestException({
      code: 10,
      message: message ?? 'no enough credit',
    });

  static readonly ORDER_NOT_PAID = (message?: string) =>
    new BadRequestException({
      code: 11,
      message: message ?? 'order not paid',
    });

  static readonly NO_DELIVERY_DAY = (message?: string) =>
    new BadRequestException({
      code: 12,
      message: message ?? 'merchant does not have a delivery day',
    });

  static readonly POINT_ALREADY_EXISTS = (message?: string) =>
    new BadRequestException({
      code: 13,
      message: message ?? 'the branch already assigned to this route',
    });

  static readonly ORDER_REJECTED = (message?: string) =>
    new BadRequestException({
      code: 14,
      message: message ?? 'order rejected',
    });

  static readonly ALREADY_EXISTS = (message?: string) =>
    new BadRequestException({
      code: 15,
      message: message ?? 'already exists',
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

// export class Notification {
//   static readonly ORDER_CREATED = (title?: string, body?: string) => ({
//     title: title ?? 'Order Created',
//     body: body ?? 'تم انشاء الطلب',
//     topic: NotificationType.NEW_ORDER,
//   });
//   static readonly ORDER_ASSIGNED = (title?: string, body?: string) => ({
//     title: title ?? 'Order Assigned',
//     body: body ?? 'لديك طلب جديد',
//     topic: NotificationType.NEW_ORDER,
//   });
//   static readonly ORDER_PAID = (title?: string, body?: string) => ({
//     title: title ?? 'Order Paid',
//     body: body ?? 'تم الدفع',
//     topic: NotificationType.ORDER_PAID,
//   });
//   static readonly ORDER_DELIVERED = (title?: string, body?: string) => ({
//     title: title ?? 'Order delivered',
//     body: body ?? 'تم توصيل الطلب',
//     topic: NotificationType.ORDER_DELIVERED,
//   });
//   static readonly CREDIT_INCREASED = (title?: string, body?: string) => ({
//     title: title ?? 'Credit Increased',
//     body: body ?? 'credit increased',
//     topic: NotificationType.CREDIT_INCREASED,
//   });

//   static readonly NEW_MESSAGE = (
//     message?: string,
//     title?: string,
//     body?: string,
//   ) => ({
//     title: title ?? 'رسالة جديدة',
//     body: message ?? body ?? 'رسالة جديدة',
//     topic: NotificationType.CHAT,
//   });
// }
