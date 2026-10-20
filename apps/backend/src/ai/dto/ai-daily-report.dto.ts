import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export const DAILY_REPORT_KINDS = ['AM', 'PM'] as const;
export type DailyReportKind = (typeof DAILY_REPORT_KINDS)[number];

export class AIDailyReportDto {
  @IsString()
  @IsIn(DAILY_REPORT_KINDS as unknown as string[])
  kind: DailyReportKind;

  @IsDateString()
  @IsOptional()
  date?: string;
}
