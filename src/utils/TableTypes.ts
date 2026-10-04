export type TableTypeOption = {
  id: string;
  name: string;
  minGuests: number;
  maxGuests: number;
  available: boolean;
  availableCount?: number;
  totalTables?: number;
  description?: string;
};

const numberFrom = (...values: any[]) => {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const countFrom = (...values: any[]) => {
  const value = values.find((item) => item !== undefined && item !== null && item !== "");
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export const normalizeTableTypes = (items: any[]): TableTypeOption[] => (Array.isArray(items) ? items : [])
  .map((item, index) => {
    const name = String(item?.name ?? item?.title ?? item?.type ?? item?.tableType ?? `Table ${index + 1}`);
    const range = name.match(/(\d+)\s*(?:-|to|–)\s*(\d+)/i);
    // The API's `capacity` is the number of tables, while the seat count is
    // encoded in `type` (for example "4-seat"). Do not use it as guest count.
    const seatsFromName = numberFrom(range?.[2], name.match(/\d+/)?.[0]);
    const maxGuests = numberFrom(item?.maxGuests, item?.seats, item?.seatCount, item?.maxCapacity, item?.maximumCapacity, seatsFromName) ?? 1;
    const minGuests = Math.min(numberFrom(item?.minCapacity, item?.minimumCapacity, item?.minGuests, range?.[1]) ?? 1, maxGuests);
    const availableCount = countFrom(item?.availableCount, item?.availableTables, item?.remaining, item?.quantityAvailable);
    const totalTables = countFrom(item?.capacity, item?.tableCount, item?.quantity);
    const status = String(item?.status ?? "").toLowerCase();
    const available = item?.isActive !== false && item?.active !== false && item?.isAvailable !== false && status !== "inactive" && status !== "unavailable" && availableCount !== 0;
    return {
      id: String(item?._id ?? item?.id ?? item?.table_type_id ?? item?.tableTypeId ?? ""),
      name,
      minGuests,
      maxGuests,
      available,
      availableCount,
      totalTables,
      description: item?.description ? String(item.description) : undefined,
    };
  })
  .filter((item) => item.id)
  .sort((left, right) => left.maxGuests - right.maxGuests)
  .map((item, index, sorted) => ({
    ...item,
    minGuests: index === 0 ? 1 : Math.min(sorted[index - 1].maxGuests + 1, item.maxGuests),
  }));

export const tableTypesFromShop = (shop: any) => normalizeTableTypes(
  shop?.tableTypes ?? shop?.table_types ?? shop?.tableType ?? shop?.tables ?? []
);
