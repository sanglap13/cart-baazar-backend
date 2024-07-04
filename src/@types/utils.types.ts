export interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}

export type TChartDataProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
};
