export interface UploadFileInterface {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	destination: string;
	filename: string;
	path: string;
	size: number;
}

// Converts JSON strings to/from your types
export class Convert {
	public static toUploadPhotoInterface(json: string): UploadFileInterface {
		return JSON.parse(json);
	}

	public static uploadPhotoInterfaceToJson(value: UploadFileInterface): string {
		return JSON.stringify(value);
	}
}
