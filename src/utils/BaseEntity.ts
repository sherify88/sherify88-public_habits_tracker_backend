
export abstract class UniEntity {
    public static from<T extends UniEntity>(c: new () => T, data: any): T {
        return Object.assign(new c(), data);
    }
    public static first<T extends UniEntity>(c: new () => T, data) {
        if (data.rows.length > 0) {
            let item = data.rows.item(0);
            return UniEntity.from(c, item);
        }
        return null;
    }

}
